"""公众号草稿发布：调用微信官方「草稿箱」接口。

需要 .env 配置 WECHAT_APPID / WECHAT_SECRET，且服务器出口 IP 已加入
公众号后台的 IP 白名单。草稿必须携带封面素材，这里会把参考文章的封面
（或正文首图）上传为永久素材作为封面。
"""

import json
from typing import Any

import requests

from .. import config
from .base import Publisher, PublishError

_API = "https://api.weixin.qq.com/cgi-bin"


class WeChatDraftPublisher(Publisher):
    target = "wechat_draft"

    def publish(self, title: str, html: str, article: dict[str, Any]) -> dict[str, Any]:
        if not (config.WECHAT_APPID and config.WECHAT_SECRET):
            raise PublishError("未配置 WECHAT_APPID / WECHAT_SECRET")

        token = self._access_token()
        thumb_media_id = self._upload_cover(token, article.get("cover_url"))

        draft = {
            "articles": [
                {
                    "title": title[:64],
                    "author": article.get("author") or "",
                    "content": html,
                    "thumb_media_id": thumb_media_id,
                    "need_open_comment": 1,
                }
            ]
        }
        resp = requests.post(
            f"{_API}/draft/add",
            params={"access_token": token},
            # 微信接口要求 UTF-8 JSON，requests 的 json= 会转义中文，手动编码
            data=json.dumps(draft, ensure_ascii=False).encode("utf-8"),
            headers={"Content-Type": "application/json; charset=utf-8"},
            timeout=30,
        ).json()
        if "media_id" not in resp:
            raise PublishError(f"创建草稿失败: {resp}")
        return {"target": self.target, "media_id": resp["media_id"]}

    def _access_token(self) -> str:
        resp = requests.get(
            f"{_API}/token",
            params={
                "grant_type": "client_credential",
                "appid": config.WECHAT_APPID,
                "secret": config.WECHAT_SECRET,
            },
            timeout=15,
        ).json()
        if "access_token" not in resp:
            raise PublishError(f"获取 access_token 失败: {resp}")
        return resp["access_token"]

    def _upload_cover(self, token: str, cover_url: str | None) -> str:
        if not cover_url:
            raise PublishError("文章没有封面图，公众号草稿必须提供封面")
        img = requests.get(cover_url, timeout=30)
        if img.status_code != 200:
            raise PublishError(f"下载封面失败: HTTP {img.status_code}")
        resp = requests.post(
            f"{_API}/material/add_material",
            params={"access_token": token, "type": "image"},
            files={"media": ("cover.jpg", img.content, "image/jpeg")},
            timeout=30,
        ).json()
        if "media_id" not in resp:
            raise PublishError(f"上传封面素材失败: {resp}")
        return resp["media_id"]
