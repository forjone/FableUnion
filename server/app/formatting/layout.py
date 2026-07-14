"""自动排版：把复刻稿（Markdown）转换成公众号编辑器可直接粘贴的行内样式 HTML。

公众号编辑器不支持 <style> 标签，所有样式必须内联。
"""

import html
import re

_STYLES = {
    "h1": "font-size:22px;font-weight:bold;color:#222;margin:24px 0 16px;line-height:1.4;",
    "h2": (
        "font-size:17px;font-weight:bold;color:#222;margin:32px 0 14px;"
        "padding-left:10px;border-left:4px solid #07c160;line-height:1.4;"
    ),
    "p": "font-size:15px;color:#3f3f3f;line-height:1.9;margin:0 0 16px;letter-spacing:0.5px;",
    "blockquote": (
        "font-size:14px;color:#888;line-height:1.8;margin:16px 0;"
        "padding:12px 16px;background:#f7f7f7;border-left:3px solid #d0d0d0;"
    ),
    "li": "font-size:15px;color:#3f3f3f;line-height:1.9;margin:0 0 8px;",
    "strong": "color:#07c160;",
}


def _inline(text: str) -> str:
    out = html.escape(text)
    out = re.sub(r"\*\*(.+?)\*\*", rf'<strong style="{_STYLES["strong"]}">\1</strong>', out)
    out = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", out)
    out = re.sub(r"`([^`]+)`", r"<code>\1</code>", out)
    return out


def markdown_to_wechat_html(md: str) -> str:
    """轻量 Markdown → 行内样式 HTML。覆盖标题/段落/引用/列表/加粗等常见语法。"""
    lines = md.strip().splitlines()
    out: list[str] = []
    list_buf: list[str] = []

    def flush_list() -> None:
        if list_buf:
            items = "".join(f'<li style="{_STYLES["li"]}">{i}</li>' for i in list_buf)
            out.append(f'<ul style="margin:0 0 16px;padding-left:24px;">{items}</ul>')
            list_buf.clear()

    for raw in lines:
        line = raw.strip()
        if not line:
            flush_list()
            continue
        if line.startswith("# "):
            flush_list()
            out.append(f'<h1 style="{_STYLES["h1"]}">{_inline(line[2:])}</h1>')
        elif line.startswith("## "):
            flush_list()
            out.append(f'<h2 style="{_STYLES["h2"]}">{_inline(line[3:])}</h2>')
        elif line.startswith("### "):
            flush_list()
            out.append(f'<h2 style="{_STYLES["h2"]}">{_inline(line[4:])}</h2>')
        elif line.startswith("> "):
            flush_list()
            out.append(f'<blockquote style="{_STYLES["blockquote"]}">{_inline(line[2:])}</blockquote>')
        elif re.match(r"^[-*]\s+", line):
            list_buf.append(_inline(re.sub(r"^[-*]\s+", "", line)))
        elif re.match(r"^\d+\.\s+", line):
            list_buf.append(_inline(re.sub(r"^\d+\.\s+", "", line)))
        elif line in ("---", "***"):
            flush_list()
            out.append('<hr style="border:none;border-top:1px solid #eee;margin:24px 0;">')
        else:
            flush_list()
            out.append(f'<p style="{_STYLES["p"]}">{_inline(line)}</p>')

    flush_list()
    return f'<section style="padding:0 8px;">{"".join(out)}</section>'


def extract_title(md: str) -> str:
    """取复刻稿第一行 `# 标题` 作为文章标题。"""
    for line in md.strip().splitlines():
        line = line.strip()
        if line.startswith("# "):
            return line[2:].strip()
        if line:
            return line[:64]
    return "未命名文章"
