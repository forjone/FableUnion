from app.formatting.layout import extract_title, markdown_to_wechat_html

MD = """# 写作变现的三个真相

开头一句话钩子。

## 真相一：坚持比天赋重要

正文段落，**重点加粗**。

- 要点一
- 要点二

> 引用一句金句

---

关注我，下期更精彩。
"""


def test_extract_title():
    assert extract_title(MD) == "写作变现的三个真相"
    assert extract_title("没有标题的第一行\n第二行") == "没有标题的第一行"


def test_html_structure():
    html = markdown_to_wechat_html(MD)
    assert html.startswith("<section")
    assert "<h1" in html and "写作变现的三个真相" in html
    assert "<h2" in html and "真相一" in html
    assert "<blockquote" in html
    assert "<li" in html and "要点一" in html
    assert "<hr" in html
    assert "<strong" in html and "重点加粗" in html


def test_inline_styles_no_style_tag():
    html = markdown_to_wechat_html(MD)
    # 公众号编辑器不支持 <style>，必须全部行内
    assert "<style" not in html
    assert 'style="' in html


def test_escapes_html():
    html = markdown_to_wechat_html("正文里有 <script>alert(1)</script> 标签")
    assert "<script>" not in html
    assert "&lt;script&gt;" in html
