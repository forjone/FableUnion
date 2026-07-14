"""SQLite 文章库。

单文件、无迁移框架的轻量存储；商业化阶段可平移到 Postgres。
"""

import json
import sqlite3
import time
from typing import Any, Optional

from . import config

_SCHEMA = """
CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT,
    platform TEXT NOT NULL DEFAULT 'wechat',
    title TEXT,
    author TEXT,
    account TEXT,
    cover_url TEXT,
    published_at TEXT,
    content_text TEXT,
    content_html TEXT,
    analysis_json TEXT,
    rewrite_text TEXT,
    rewrite_html TEXT,
    created_at REAL NOT NULL
);
"""


def _conn() -> sqlite3.Connection:
    conn = sqlite3.connect(config.DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute(_SCHEMA)
    return conn


def _row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    d = dict(row)
    if d.get("analysis_json"):
        d["analysis"] = json.loads(d["analysis_json"])
    else:
        d["analysis"] = None
    d.pop("analysis_json", None)
    return d


def save_article(article: dict[str, Any]) -> int:
    with _conn() as conn:
        cur = conn.execute(
            """
            INSERT INTO articles
              (url, platform, title, author, account, cover_url,
               published_at, content_text, content_html, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                article.get("url"),
                article.get("platform", "wechat"),
                article.get("title"),
                article.get("author"),
                article.get("account"),
                article.get("cover_url"),
                article.get("published_at"),
                article.get("content_text"),
                article.get("content_html"),
                time.time(),
            ),
        )
        return cur.lastrowid


def get_article(article_id: int) -> Optional[dict[str, Any]]:
    with _conn() as conn:
        row = conn.execute(
            "SELECT * FROM articles WHERE id = ?", (article_id,)
        ).fetchone()
    return _row_to_dict(row) if row else None


def list_articles(limit: int = 100) -> list[dict[str, Any]]:
    with _conn() as conn:
        rows = conn.execute(
            """
            SELECT id, url, platform, title, author, account, cover_url,
                   published_at, created_at,
                   analysis_json IS NOT NULL AS has_analysis,
                   rewrite_text IS NOT NULL AS has_rewrite
            FROM articles ORDER BY id DESC LIMIT ?
            """,
            (limit,),
        ).fetchall()
    return [dict(r) for r in rows]


def update_article(article_id: int, **fields: Any) -> None:
    allowed = {"analysis_json", "rewrite_text", "rewrite_html"}
    updates = {k: v for k, v in fields.items() if k in allowed}
    if not updates:
        return
    sets = ", ".join(f"{k} = ?" for k in updates)
    with _conn() as conn:
        conn.execute(
            f"UPDATE articles SET {sets} WHERE id = ?",
            (*updates.values(), article_id),
        )


def delete_article(article_id: int) -> None:
    with _conn() as conn:
        conn.execute("DELETE FROM articles WHERE id = ?", (article_id,))
