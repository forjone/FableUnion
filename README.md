# 小灵造造 · FableUnion

> 让孩子用说话就能"造出"游戏的创作工具 —— 孩子说出想法 → AI 画出草图 → 确认后自动生成可玩的成品，并支持继续迭代。

**核心宗旨：释放孩子的想象力，让想象力成为现实——交互更简单，呈现更直观。**

本仓库是 PRD v0.1 的 MVP 实现（Web 原型、文字输入模拟语音、游戏类型、完整六阶段闭环）。
应用形态与视觉分镜对照 `儿童课程交互原型设计/` 目录下的高保真原型：1194×834 iPad 横屏卡片、
自适应缩放、暖沙色设计语言、吉祥物"小灵"、顶部五点旅程条。V2 可用 Capacitor 直接打包 iOS（配套 iOS/macOS 外壳见原型目录）。

## 快速开始

```bash
npm install
npm run dev      # 开发预览
npm test         # 需求拆解引擎单元测试
npm run build    # 类型检查 + 生产构建
```

打开页面 → 点大圆麦克风 → 说话（Chrome/Safari 支持真麦克风）或打字，例如：

- `我想要恐龙赛跑，恐龙一定要会喷火！` —— 槽位齐全，直达草图；喷火成为游戏里的"大招"按钮
- `恐龙赛跑还要收集星星` —— 组合玩法：一边跑一边捡星星
- `小猫的画廊` / `给独角兽做一本故事书` —— 网站类作品：生成真实网页，可保存成 HTML 送人
- `我想要一个小猫的游戏` —— 玩法缺失，触发双草图二选一
- `土豆侠在糖果世界跳来跳去` —— 词库外主角也能成为主角
- `恐龙赛跑，难不难呀` —— 规则类分歧，触发兜底图卡选择题
- `我要一只真的恐龙` —— 触发"永远不说不行"转译

游戏成品可点「分享」复制链接（作品编码在 URL 里，打开即玩）；右下角 ⚙ 是 PIN 保护的**家长小屋**：
AI 配置、年龄档位（低龄档 4–6 岁纯图形界面）、生成记录、安全日志、成功指标（PRD 第 8 节）、一键清空本机数据。

## 六阶段闭环（PRD 第 2 节）

```
① 语音倾听 → ② 需求拆解＋草图隐式确认 →（孩子打断→分歧处理，回到②）
→ ③ 复述确认＋终稿视觉【唯一显式确认关卡】→（不满意→回到②）
→ ④ 深度构建 → ⑤ 成品完成＋继续迭代（→回到①）
```

- **草图隐式确认**：草图配讲故事旁白呈现，8 秒沉默即视为通过；只有孩子主动点「✋ 不是这样的」才进入分歧处理。
- **分歧处理**：默认并排两张草图直接指选（零提问优先）；只有无法用画面区分的规则类分歧（如难度）才降级为图卡选择题。一次只处理一个分歧点。
- **唯一显式确认**：终稿视觉 + 用孩子原话复述（"我们要做一个喷火的恐龙在大草地里玩'赛跑'的游戏，对不对呀？"），点「✅ 对」才开始耗费构建资源。
- **永远不说"不行"**：无法实现的需求（真的恐龙 / 一百关 / 联网）自动转译成可实现的相近版本再继续。

## AI 魔法图（图片生成）

终稿视觉（PRD 3.5）接入了 OpenAI 兼容的图片生成接口：进入确认页时**后台**开始生成，
不阻塞孩子确认；生成好后以"魔法上色"淡入替换手绘终稿，并成为作品档案的封面。
失败或未配置时静默回退到手绘图，**流程永不因图片生成卡住**（北极星准则 2：速度感即体验）。

配置方式：点击右下角 ⚙（设置与家长面板，孩子界面不可见）：

| 字段 | 说明 |
|---|---|
| API 地址 | 默认 `/imggen/v1`，经 Vite 同源代理转发到 `https://sub.tkrednote.com/v1`（见 `vite.config.ts`，避免浏览器 CORS）；填 `mock` 进入演示模式 |
| API Key | `sk-…`（仅存浏览器 localStorage） |
| 模型 | 默认 `gpt-image-2` |

实际请求体与下述 curl 等价（`src/app/imagegen.ts`）：

```bash
curl -X POST https://sub.tkrednote.com/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-xxxxx" \
  -d '{ "model": "gpt-image-2", "prompt": "<由槽位拼装>", "n": 1, "size": "1024x1024", "response_format": "url" }'
```

prompt 由槽位自动拼装（中文描述 + 英文风格词），固定追加儿童安全后缀（wholesome / no text / no scary elements）。
生产部署时需在网关配置 `/imggen/* → 图片生成服务` 的同样转发。

## 真实语音输入

倾听页已接入浏览器 SpeechRecognition（Chrome / Safari 可用）：支持的环境里孩子直接说话，
实时转写进输入框（最终片段追加、临时片段预览）；不支持的环境静默回退到打字模拟。TTS 播报不变。

## 代码结构 → PRD 模块映射

| 目录/文件 | PRD 模块 | 说明 |
|---|---|---|
| `src/engine/parser.ts` | 3.2 需求拆解引擎 + 3.3 分歧处理 | 五槽位真实判定：词库匹配 / 否定处理 / 自定义主角捕获 / 置信度标注 / 默认填充 / 分歧检测；含"永远不说不行"转译层 |
| `src/engine/lexicon.ts` | 3.2 | 主体 / 场景 / 玩法 / 基调 / 关键细节词库 |
| `src/engine/sketch.ts` | 3.4 / 3.5 草图与终稿 | 程序化 SVG，毫秒级出图（速度感即体验）；draft 蜡笔风低保真，final 带标题横幅 |
| `src/engine/story.ts` | 北极星准则 3 | 所有面向孩子的语言：讲故事旁白 / 原话复述 / 故事化构建进度，不暴露任何"槽位"痕迹 |
| `src/engine/game.ts` | 3.6 深度构建 | 槽位参数化 Canvas 小游戏：赛跑 / 收集 / 躲避 / 跳跃 / 戳泡泡五种模板；喷火、会飞等关键细节转化为游戏特效；永不挫败设计 |
| `src/app/speech.ts` | 3.1 语音交互 | TTS 用浏览器 speechSynthesis（活泼、偏慢、可打断），STT 按 MVP 范围用文字模拟 |
| `src/app/archive.ts` | 3.7 作品档案 | localStorage 持久化：PRD 第 6 节格式槽位 JSON + 对话历史 + 构建参数；支持"接着上次的改" |
| `src/ui/App.tsx` | 第 2 节流程 | 六阶段状态机 |
| `src/ui/stages.tsx` / `GameCanvas.tsx` | 第 4 节交互 | 低龄档 UI：大按钮、图形优先、文字仅辅助 |

右下角 ⚙️ 可打开内部骨架面板（开发/家长用），实时查看槽位 JSON 与置信度——孩子界面上永远不出现这些结构。

## 槽位 JSON 示例（引擎实际输出）

```json
{
  "creation_type": "game",
  "subject": "恐龙",
  "scene": "大草地",
  "mechanic": "赛跑",
  "tone": "lively",
  "key_detail": "会喷火",
  "difficulty": "easy",
  "confidence": {
    "subject": "high",
    "scene": "medium_inferred",
    "mechanic": "high",
    "tone": "medium_inferred",
    "key_detail": "high"
  }
}
```

## 打包 iOS 应用（Capacitor）

`capacitor.config.ts` 已就绪（appId `com.fableunion.xiaoling`）。在装有 Xcode 的 Mac 上：

```bash
npm i -D @capacitor/cli @capacitor/core @capacitor/ios
npm run build
npx cap add ios && npx cap sync ios && npx cap open ios
```

原生壳内的图片生成需把 `/imggen` 指向可达的代理，或在家长小屋里把 API 地址改成完整 URL。

## 部署

- **Vercel**：`vercel.json` 已配置 `/imggen/* → sub.tkrednote.com` 的转发，直接 `vercel deploy` 即可
- 其他平台：静态托管 `dist/`，并在网关配置同样的 `/imggen` 反向代理

## 功能完成度（对照 PRD）

| PRD 范围 | 状态 |
|---|---|
| V1：六阶段闭环 / 真实槽位引擎 / 分歧处理 / 游戏构建 | ✅ |
| V2：真实语音输入（浏览器 STT）/ 网站类型 / 年龄档分层 | ✅ |
| V3：家长层（PIN+记录+安全日志）/ 内容安全过滤 / 作品档案 | ✅（本地版） |
| 引擎升级：LLM 语义归一（可配置）/ 玩法组合 / 指标埋点 | ✅ |
| 附加：AI 魔法图 / 游戏链接分享 / 网页导出 / Capacitor 配置 | ✅ |
| 待做：儿童定制 STT 服务、云端档案同步、生成图片二次审核 | ⬜（需外部服务） |
