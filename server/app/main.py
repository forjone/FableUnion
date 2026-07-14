"""FableUnion 创作者工具箱 — API 入口。

流水线：采集 → 拆解 → 复刻 → 排版 → 发布
"""

import json
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from . import storage
from .analysis.analyzer import analyze_article
from .analysis.rewriter import rewrite_article
from .formatting.layout import extract_title, markdown_to_wechat_html
from .publish import PublishError, get_publisher
from .scrapers import ScrapeError, get_scraper

app = FastAPI(title="FableUnion 创作者工具箱", version="0.1.0")

# 浏览器插件从公众号页面直接调用本地 API，需要放开 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_STATIC = Path(__file__).resolve().parent.parent / "static"


class CollectRequest(BaseModel):
    url: str
    html: Optional[str] = None  # 浏览器插件路径：直接提交页面 HTML


class RewriteRequest(BaseModel):
    topic: Optional[str] = None


class PublishRequest(BaseModel):
    target: str = "webhook"  # webhook | wechat_draft


@app.get("/", include_in_schema=False)
def index() -> FileResponse:
    return FileResponse(_STATIC / "index.html")


@app.post("/api/articles/collect")
def collect(req: CollectRequest) -> dict:
    scraper = get_scraper(req.url)
    if scraper is None:
        raise HTTPException(400, "暂不支持该平台的链接（当前支持：mp.weixin.qq.com）")
    try:
        if req.html:
            article = scraper.parse_html(req.html, req.url)
        else:
            article = scraper.scrape(req.url)
    except ScrapeError as e:
        raise HTTPException(422, str(e))
    article_id = storage.save_article(article)
    return {"id": article_id, "title": article.get("title")}


@app.get("/api/articles")
def articles() -> list:
    return storage.list_articles()


@app.get("/api/articles/{article_id}")
def article_detail(article_id: int) -> dict:
    article = _get(article_id)
    return article


@app.delete("/api/articles/{article_id}")
def article_delete(article_id: int) -> dict:
    _get(article_id)
    storage.delete_article(article_id)
    return {"ok": True}


@app.post("/api/articles/{article_id}/analyze")
def analyze(article_id: int) -> dict:
    article = _get(article_id)
    if not article.get("content_text"):
        raise HTTPException(422, "文章没有正文，无法拆解")
    try:
        analysis = analyze_article(
            article.get("title") or "",
            article.get("author") or article.get("account") or "",
            article["content_text"],
        )
    except RuntimeError as e:
        raise HTTPException(503, str(e))
    storage.update_article(article_id, analysis_json=json.dumps(analysis, ensure_ascii=False))
    return analysis


@app.post("/api/articles/{article_id}/rewrite")
def rewrite(article_id: int, req: RewriteRequest) -> dict:
    article = _get(article_id)
    if not article.get("content_text"):
        raise HTTPException(422, "文章没有正文，无法复刻")
    try:
        text = rewrite_article(
            article.get("title") or "",
            article["content_text"],
            analysis=article.get("analysis"),
            topic=req.topic,
        )
    except RuntimeError as e:
        raise HTTPException(503, str(e))
    storage.update_article(article_id, rewrite_text=text)
    return {"rewrite_text": text}


@app.post("/api/articles/{article_id}/format")
def format_rewrite(article_id: int) -> dict:
    article = _get(article_id)
    if not article.get("rewrite_text"):
        raise HTTPException(422, "还没有复刻稿，请先调用 rewrite")
    html = markdown_to_wechat_html(article["rewrite_text"])
    storage.update_article(article_id, rewrite_html=html)
    return {"rewrite_html": html}


@app.post("/api/articles/{article_id}/publish")
def publish(article_id: int, req: PublishRequest) -> dict:
    article = _get(article_id)
    if not article.get("rewrite_text"):
        raise HTTPException(422, "还没有复刻稿，请先调用 rewrite")
    html = article.get("rewrite_html") or markdown_to_wechat_html(article["rewrite_text"])
    title = extract_title(article["rewrite_text"])
    try:
        result = get_publisher(req.target).publish(title, html, article)
    except PublishError as e:
        raise HTTPException(502, str(e))
    return result


def _get(article_id: int) -> dict:
    article = storage.get_article(article_id)
    if article is None:
        raise HTTPException(404, "文章不存在")
    return article
