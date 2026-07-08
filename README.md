# FableUnion

**不同人生的体验。** 一个「人生引擎 + 人生包」架构的叙事模拟游戏。

第一个人生包：**《出海建站人生》**——扮演不同背景的角色，经历真实出海路上的随机事件与抉择，
从日入一刀走向工资自由（或者走向别的什么结局），最终生成一张可分享的「人生结局卡」。
主打心路历程的共鸣，灵感来自大富翁、财富流、《摆摊王逆袭》与人生重开模拟器。

## 快速开始

```bash
npm install
npm run dev       # 本地开发
npm test          # 引擎单测 + 蒙特卡洛数值平衡模拟
npm run build     # 生产构建
npm run test:e2e  # 真实浏览器端到端冒烟（先 build；可用 FABLE_CHROME 指定浏览器）
```

推送到 `main` 后 CI 自动构建并发布到 GitHub Pages（需在仓库 Settings → Pages 将 Source 设为 GitHub Actions）。

## 玩法特性

- 4 个可玩角色（3 个通过元进度解锁），各有专属事件线、精力规则与生活成本
- 100+ 张事件卡：日常 / 命运 / 风口三层卡池，风口需要前置积累才接得住
- 小人系统：喜怒哀乐悲五态可视，房间陈设随收入梯度升级
- 周结算、事件结果、里程碑全屏演出、WebAudio 合成音效
- 结局图鉴 / 成就图鉴 / 本地最佳战绩榜，驱动重开
- Canvas 结局分享卡（含小人的最终状态与收入曲线）
- 新手引导、设置（音效 / 快速结算 / 放弃本局）、本地存档续玩（带版本号）
- 全球排行榜（可选）：结局页一键上榜、图鉴页查看全球前 20

## 全球排行榜部署（可选）

后端是一个 Cloudflare Worker + D1，代码在 [`server/`](server/)：

1. `wrangler d1 create fableunion-leaderboard`，把 database_id 填进 `server/wrangler.toml`
2. `wrangler d1 execute fableunion-leaderboard --file=server/schema.sql --remote`
3. `cd server && wrangler deploy`
4. 仓库 Settings → Secrets and variables → Actions → **Variables** 新增
   `VITE_LEADERBOARD_URL = https://<你的 worker 域名>`，下次部署自动启用。
   未配置时游戏保持纯本地运行，榜单入口不显示。

## 立绘资源

角色高清原稿在 `images/`；线上使用的是 `public/images/buddies/` 下的 512px WebP
（约 30KB/张）。原稿更新后运行 `node scripts/optimize-buddies.mjs` 重新生成。

## 架构

```
src/
├── engine/           # 人生引擎（通用，零领域概念）
│   ├── types.ts      #   条件/效果/事件(storylet)/任务/结局 等类型
│   ├── engine.ts     #   回合推进、事件抽取、结局评价
│   ├── conditions.ts #   条件求值器
│   ├── effects.ts    #   效果应用器（含属性钳位）
│   ├── director.ts   #   情绪节拍导演（防连续挫败/顺风必有逆风）
│   └── rng.ts        #   种子随机
├── content/
│   └── site-builder/ # 人生包 #1：出海建站（纯数据，可替换）
│       ├── base.ts   #   属性 / 角色 / 任务 / 里程碑
│       ├── events-*.ts # 三层事件池：日常 / 命运 / 风口（银翅膀）
│       └── endings.ts  # 结局 = 状态评价函数
└── ui/               # React 界面（开局 / 游戏 / 结局卡）
```

设计文档见 [`docs/`](docs/)：需求拆解与可行性分析、人生模拟方向与游戏设计框架。

## 核心设计

- **Storylet 事件系统**：事件互不相连，通过状态间接耦合——加内容成本线性而非指数。
- **结局是评价函数**：对终局状态打分匹配，而非剧情树叶子；开放感来自组合空间。
- **风口卡（wing）**：稀有机会需要前置条件才接得住，错过会被明确告知——遗憾驱动重开。
- **节拍导演**：连续两次负面事件后屏蔽负面；顺风三连后加倍逆风权重。
- **数值平衡由模拟守护**：`balance.sim.test.ts` 用随机贪心策略跑 200 段人生，断言结局分布健康。
