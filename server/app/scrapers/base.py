"""采集器接口。

新平台（抖音 / 视频号 / YouTube / 小红书…）只需实现一个 Scraper 子类并
调用 register() 注册，采集入口自动按 URL 路由。
"""

from abc import ABC, abstractmethod
from typing import Any, Optional


class ScrapeError(Exception):
    pass


class Scraper(ABC):
    platform: str = ""

    @abstractmethod
    def match(self, url: str) -> bool:
        """该采集器是否能处理这个 URL。"""

    @abstractmethod
    def scrape(self, url: str) -> dict[str, Any]:
        """抓取并返回统一的内容字典（见 storage.save_article 的字段）。"""

    def parse_html(self, html: str, url: str = "") -> dict[str, Any]:
        """从调用方提供的 HTML 解析（浏览器插件路径）。默认不支持。"""
        raise ScrapeError(f"{self.platform} 不支持从 HTML 解析")


_REGISTRY: list[Scraper] = []


def register(scraper: Scraper) -> None:
    _REGISTRY.append(scraper)


def get_scraper(url: str) -> Optional[Scraper]:
    for s in _REGISTRY:
        if s.match(url):
            return s
    return None
