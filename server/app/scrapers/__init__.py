from .base import Scraper, ScrapeError, get_scraper
from . import wechat  # noqa: F401  注册公众号采集器

__all__ = ["Scraper", "ScrapeError", "get_scraper"]
