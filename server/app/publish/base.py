"""发布适配器接口。

新渠道（抖音 / 视频号 / 头条…，或对接自建自动发布平台）实现 Publisher
子类即可。target 名称由 API 的 publish 请求指定。
"""

from abc import ABC, abstractmethod
from typing import Any


class PublishError(Exception):
    pass


class Publisher(ABC):
    target: str = ""

    @abstractmethod
    def publish(self, title: str, html: str, article: dict[str, Any]) -> dict[str, Any]:
        """发布内容，返回渠道方的结果信息（如草稿 media_id）。"""


def get_publisher(target: str) -> Publisher:
    from .wechat_draft import WeChatDraftPublisher
    from .webhook import WebhookPublisher

    publishers: dict[str, type[Publisher]] = {
        "wechat_draft": WeChatDraftPublisher,
        "webhook": WebhookPublisher,
    }
    if target not in publishers:
        raise PublishError(f"未知的发布渠道: {target}（支持: {', '.join(publishers)}）")
    return publishers[target]()
