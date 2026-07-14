"""Webhook 发布：把排版好的文章推送到已有的自动发布平台。

对方收到的 JSON:
{
  "type": "article",
  "title": ...,
  "html": ...,          # 行内样式，公众号可直接用
  "markdown": ...,      # 复刻稿原文
  "cover_url": ...,
  "source_url": ...     # 参考的原文链接
}
"""

from typing import Any

import requests

from .. import config
from .base import Publisher, PublishError


class WebhookPublisher(Publisher):
    target = "webhook"

    def publish(self, title: str, html: str, article: dict[str, Any]) -> dict[str, Any]:
        if not config.PUBLISH_WEBHOOK_URL:
            raise PublishError("未配置 PUBLISH_WEBHOOK_URL")

        headers = {"Content-Type": "application/json"}
        if config.PUBLISH_WEBHOOK_TOKEN:
            headers["Authorization"] = f"Bearer {config.PUBLISH_WEBHOOK_TOKEN}"

        try:
            resp = requests.post(
                config.PUBLISH_WEBHOOK_URL,
                json={
                    "type": "article",
                    "title": title,
                    "html": html,
                    "markdown": article.get("rewrite_text"),
                    "cover_url": article.get("cover_url"),
                    "source_url": article.get("url"),
                },
                headers=headers,
                timeout=30,
            )
            resp.raise_for_status()
        except requests.RequestException as e:
            raise PublishError(f"Webhook 推送失败: {e}") from e

        return {"target": self.target, "status_code": resp.status_code}
