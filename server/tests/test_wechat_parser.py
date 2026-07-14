from pathlib import Path

import pytest

from app.scrapers.base import ScrapeError
from app.scrapers.wechat import WeChatScraper

FIXTURE = (Path(__file__).parent / "fixtures" / "wechat_article.html").read_text(
    encoding="utf-8"
)
URL = "https://mp.weixin.qq.com/s/abc123"


@pytest.fixture
def article():
    return WeChatScraper().parse_html(FIXTURE, URL)


def test_match():
    s = WeChatScraper()
    assert s.match(URL)
    assert not s.match("https://www.douyin.com/video/1")


def test_metadata(article):
    assert article["title"] == "普通人如何靠写作月入过万？"
    assert article["author"] == "老王"
    assert article["account"] == "写作研究所"
    assert article["url"] == URL
    assert article["platform"] == "wechat"


def test_cover_prefers_script_var(article):
    assert article["cover_url"] == "https://mmbiz.qpic.cn/cover_real.jpg"


def test_published_at_from_ct(article):
    assert article["published_at"].startswith("2024-07-03")


def test_content(article):
    assert "月薪五千" in article["content_text"]
    assert "关注我" in article["content_text"]
    # 懒加载图片地址被提升为 src
    assert 'src="https://mmbiz.qpic.cn/pic1.jpg"' in article["content_html"]
    # 正文容器的 visibility:hidden 行内样式被移除
    assert "visibility: hidden" not in article["content_html"]


def test_missing_content_raises():
    with pytest.raises(ScrapeError):
        WeChatScraper().parse_html("<html><body>nothing</body></html>", URL)
