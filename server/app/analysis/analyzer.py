"""爆款文章拆解：标题、钩子、结构、案例、金句、转化点。

使用 Claude 结构化输出，保证返回结果可直接入库和渲染。
"""

from typing import List, Optional

import anthropic
from pydantic import BaseModel, Field

from .. import config

MODEL = "claude-opus-4-8"


class SectionNote(BaseModel):
    section: str = Field(description="段落/部分的小标题或概括")
    role: str = Field(description="该部分在全文结构中承担的作用，例如：抛出痛点、给出案例、递进论证、引导转化")


class ArticleAnalysis(BaseModel):
    title_technique: str = Field(description="标题使用的套路与吸引力来源（悬念/数字/反差/身份代入等），以及为什么有效")
    hook: str = Field(description="开头钩子：前几段如何抓住读者，用了什么手法")
    structure: List[SectionNote] = Field(description="全文结构拆解，按顺序列出各部分及其作用")
    cases: List[str] = Field(description="文中使用的案例/故事/数据，各自的作用")
    golden_sentences: List[str] = Field(description="金句摘录（原文原句）")
    conversion_points: List[str] = Field(description="转化点：引导关注/点赞/购买/私域的位置与话术")
    target_audience: str = Field(description="目标读者画像")
    replicable_formula: str = Field(description="总结出的可复用创作公式，供复刻同类文章时参考")
    topic_direction: Optional[str] = Field(default=None, description="选题方向归类，例如：职场成长、AI 工具、情感共鸣")


_SYSTEM = """你是资深的新媒体内容分析师，擅长拆解公众号爆款文章的写作手法。
分析要具体、可操作：指出"用了什么手法、为什么有效、如何复用"，避免空泛评价。
金句必须摘录原文原句，不要改写。"""


def analyze_article(title: str, author: str, content_text: str) -> dict:
    if not config.ANTHROPIC_API_KEY:
        raise RuntimeError("未配置 ANTHROPIC_API_KEY，无法使用拆解功能")

    client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)
    response = client.messages.parse(
        model=MODEL,
        max_tokens=16000,
        thinking={"type": "adaptive"},
        system=_SYSTEM,
        messages=[
            {
                "role": "user",
                "content": (
                    f"请拆解这篇公众号文章。\n\n"
                    f"标题：{title}\n作者：{author or '未知'}\n\n正文：\n{content_text}"
                ),
            }
        ],
        output_format=ArticleAnalysis,
    )
    return response.parsed_output.model_dump()
