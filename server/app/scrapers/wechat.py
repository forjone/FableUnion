"""微信公众号文章采集器（mp.weixin.qq.com）。

公众号文章页是服务端渲染的静态 HTML，关键信息位置：
- 标题:     #activity-name / og:title
- 公众号名: #js_name
- 作者:     #js_author_name / meta[name=author]
- 正文:     #js_content（图片懒加载，真实地址在 data-src）
- 封面:     页面脚本里的 msg_cdn_url 变量 / og:image
- 发布时间: 页面脚本里的 ct（createTime，秒级时间戳）
"""

import re
from datetime import datetime, timezone
from typing import Any

import requests
from bs4 import BeautifulSoup

from .base import Scraper, ScrapeError, register

_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)


class WeChatScraper(Scraper):
    platform = "wechat"

    def match(self, url: str) -> bool:
        return "mp.weixin.qq.com" in url

    def scrape(self, url: str) -> dict[str, Any]:
        try:
            resp = requests.get(url, headers={"User-Agent": _UA}, timeout=20)
            resp.raise_for_status()
        except requests.RequestException as e:
            raise ScrapeError(f"抓取失败: {e}") from e
        resp.encoding = "utf-8"
        return self.parse_html(resp.text, url)

    def parse_html(self, html: str, url: str = "") -> dict[str, Any]:
        soup = BeautifulSoup(html, "lxml")

        if "环境异常" in html and "完成验证" in html:
            raise ScrapeError("公众号返回了验证页（访问频率受限），请稍后重试或改用浏览器插件采集")

        title = _text(soup, "#activity-name") or _meta(soup, "og:title")
        account = _text(soup, "#js_name")
        author = _text(soup, "#js_author_name") or _meta_name(soup, "author")

        content = soup.select_one("#js_content")
        if content is None:
            raise ScrapeError("未找到正文（#js_content）——链接可能不是公众号文章，或文章已被删除")

        # 懒加载图片：把真实地址 data-src 提升为 src
        for img in content.select("img[data-src]"):
            img["src"] = img["data-src"]
        # 公众号正文默认 visibility:hidden，去掉行内样式让离线 HTML 可见
        if content.has_attr("style"):
            del content["style"]

        content_html = content.decode_contents().strip()
        content_text = content.get_text("\n", strip=True)

        cover = _script_var(html, "msg_cdn_url") or _meta(soup, "og:image")

        published_at = None
        ct = _script_var(html, "ct")
        if ct and ct.isdigit():
            published_at = datetime.fromtimestamp(
                int(ct), tz=timezone.utc
            ).astimezone().strftime("%Y-%m-%d %H:%M")

        if not title and not content_text:
            raise ScrapeError("解析结果为空，页面结构可能已变化")

        return {
            "url": url,
            "platform": self.platform,
            "title": title,
            "author": author,
            "account": account,
            "cover_url": cover,
            "published_at": published_at,
            "content_text": content_text,
            "content_html": content_html,
        }


def _text(soup: BeautifulSoup, selector: str) -> str:
    el = soup.select_one(selector)
    return el.get_text(strip=True) if el else ""


def _meta(soup: BeautifulSoup, prop: str) -> str:
    el = soup.find("meta", property=prop)
    return el.get("content", "").strip() if el else ""


def _meta_name(soup: BeautifulSoup, name: str) -> str:
    el = soup.find("meta", attrs={"name": name})
    return el.get("content", "").strip() if el else ""


def _script_var(html: str, name: str) -> str:
    """提取页面脚本中的 var name = "value"; 形式的变量。"""
    m = re.search(rf'\b(?:var\s+)?{name}\s*=\s*["\']([^"\']*)["\']', html)
    return m.group(1) if m else ""


register(WeChatScraper())
