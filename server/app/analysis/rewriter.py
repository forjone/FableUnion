"""原创复刻：基于爆款拆解结果，生成同方向但原创表达的新文章。

输出可能较长，使用流式请求避免 HTTP 超时。
"""

import json
from typing import Optional

import anthropic

from .. import config

MODEL = "claude-opus-4-8"

_SYSTEM = """你是优秀的公众号作者。你的任务是参考一篇爆款文章的**写作手法**（结构、钩子、节奏、转化设计），
创作一篇全新的原创文章。

严格要求：
- 只借鉴手法与框架，不复制原文的句子、案例和独特观点——所有表达必须是原创的
- 案例可以替换为同类型的其他真实常见场景，不得虚构具体的人名、公司数据
- 输出 Markdown 格式：第一行是 `# 标题`，正文用二级标题分段
- 语言风格自然流畅，符合公众号阅读习惯（段落短、有对话感）"""


def rewrite_article(
    title: str,
    content_text: str,
    analysis: Optional[dict] = None,
    topic: Optional[str] = None,
) -> str:
    if not config.ANTHROPIC_API_KEY:
        raise RuntimeError("未配置 ANTHROPIC_API_KEY，无法使用复刻功能")

    parts = [f"参考文章标题:{title}\n\n参考文章正文:\n{content_text}"]
    if analysis:
        parts.append(
            "这篇文章的手法拆解（重点参考 replicable_formula）：\n"
            + json.dumps(analysis, ensure_ascii=False, indent=2)
        )
    if topic:
        parts.append(f"新文章的主题/方向：{topic}")
    else:
        parts.append("新文章写同一选题方向下的另一个角度，自行确定具体主题。")
    parts.append("请创作新文章。")

    client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)
    with client.messages.stream(
        model=MODEL,
        max_tokens=32000,
        thinking={"type": "adaptive"},
        system=_SYSTEM,
        messages=[{"role": "user", "content": "\n\n---\n\n".join(parts)}],
    ) as stream:
        message = stream.get_final_message()

    return next(b.text for b in message.content if b.type == "text").strip()
