"""集中读取环境变量配置。"""

import os
from pathlib import Path

from dotenv import load_dotenv

# server/.env（与 app/ 同级）
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

DB_PATH = os.environ.get("FABLEUNION_DB") or str(
    Path(__file__).resolve().parent.parent / "fableunion.db"
)

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

WECHAT_APPID = os.environ.get("WECHAT_APPID", "")
WECHAT_SECRET = os.environ.get("WECHAT_SECRET", "")

PUBLISH_WEBHOOK_URL = os.environ.get("PUBLISH_WEBHOOK_URL", "")
PUBLISH_WEBHOOK_TOKEN = os.environ.get("PUBLISH_WEBHOOK_TOKEN", "")
