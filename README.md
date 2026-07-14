# FableUnion 创作者工具箱

> 内容采集/下载 → 爆款拆解 → 趋势研究 → 原创复刻 → 排版/视频生成 → 自动发布 → 数据复盘

帮助创作者研究爆款、复刻创作、自动发布的一站式工具箱。

## MVP 范围（当前版本）

以**微信公众号文章**为起点的完整闭环：

1. **采集** — 输入公众号文章链接（或通过浏览器插件抓取当前页面），保存正文、标题、作者、封面、发布时间等元数据
2. **拆解** — 用 Claude 分析爆款结构：标题套路、开头钩子、行文结构、案例、金句、转化点
3. **复刻** — 生成同方向但原创表达的新文章
4. **排版** — 自动排版为公众号可用的 HTML
5. **发布** — 创建公众号草稿（微信官方 API），或推送到已有的自动发布平台（Webhook）

## 项目结构

```
FableUnion/
├── server/              # FastAPI 后端 + Web 界面
│   ├── app/
│   │   ├── main.py          # API 入口
│   │   ├── config.py        # 配置（环境变量）
│   │   ├── storage.py       # SQLite 文章库
│   │   ├── scrapers/        # 内容采集（当前：公众号；预留：抖音/视频号/YouTube）
│   │   ├── analysis/        # 爆款拆解 + 原创复刻（Claude API）
│   │   ├── formatting/      # 自动排版
│   │   └── publish/         # 发布适配器（公众号草稿 / Webhook）
│   ├── static/index.html    # Web 界面
│   └── tests/               # 单元测试
├── extension/           # Chrome 浏览器插件（Manifest V3）
└── docs/ROADMAP.md      # 路线图
```

## 快速开始

### 1. 启动后端

```bash
cd server
pip install -r requirements.txt

# 配置（至少需要 ANTHROPIC_API_KEY 才能使用拆解/复刻功能）
cp .env.example .env && edit .env

uvicorn app.main:app --reload --port 8300
```

打开 http://localhost:8300 即可使用 Web 界面。

### 2. 安装浏览器插件（可选）

1. 打开 Chrome → `chrome://extensions` → 打开「开发者模式」
2. 「加载已解压的扩展程序」→ 选择 `extension/` 目录
3. 打开任意公众号文章页面，点击插件图标 → 「保存到工具箱」

插件默认把文章发送到 `http://localhost:8300`，可在弹窗中修改后端地址。

## API 概览

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/articles/collect` | 采集文章（`{"url": ...}` 或插件提交的 `{"html": ..., "url": ...}`） |
| GET | `/api/articles` | 文章列表 |
| GET | `/api/articles/{id}` | 文章详情 |
| POST | `/api/articles/{id}/analyze` | 爆款拆解 |
| POST | `/api/articles/{id}/rewrite` | 原创复刻（`{"topic": "可选的新主题/方向"}`） |
| POST | `/api/articles/{id}/format` | 自动排版复刻稿 |
| POST | `/api/articles/{id}/publish` | 发布（`{"target": "wechat_draft" | "webhook"}`） |

## 配置

`server/.env`：

```bash
ANTHROPIC_API_KEY=sk-ant-...   # 拆解/复刻所需
WECHAT_APPID=                  # 公众号草稿发布（可选）
WECHAT_SECRET=
PUBLISH_WEBHOOK_URL=           # 已有自动发布平台的接收地址（可选）
```

## 路线图

见 [docs/ROADMAP.md](docs/ROADMAP.md)：抖音/视频号/YouTube 采集、趋势研究、会员体系、Filmgine 视频生成接入等。

## 合规说明

本工具仅用于个人学习研究与自有内容管理。采集内容请遵守目标平台的服务条款；「复刻」功能生成的是同方向的**原创表达**，请勿用于抄袭、洗稿等侵权行为。
