# 小人视觉与游戏化主界面设计

## 背景

FableUnion 目前是 Vite + React 的叙事模拟游戏。引擎层 `src/engine/` 保持纯状态机，人生包数据位于 `src/content/site-builder/`，UI 位于 `src/ui/`。现有小人系统集中在 `src/ui/Buddy.tsx`，用 SVG 表达喜怒哀乐悲五态，并被游戏主界面和结局分享卡复用。

本次目标是提升角色代入感和游戏感：

- 使用 `images/` 中的小贝/小川状态图，按人生角色选择视觉角色。
- 将小人从 SVG 改为 2.5D 小舞台，有立绘、空间、阴影、轻动画和状态反馈。
- 将主界面从网页式表单改为更像模拟经营游戏的“每周行动面板”。
- 开始页、游戏页、结局分享卡保持同一套角色视觉。

## 非目标

- 不引入 Three.js 或真 3D 模型。
- 不修改人生引擎的状态结构和结算规则。
- 不重做事件内容、数值平衡或存档版本，除非 UI 兼容性要求必须调整。
- 不把“用户性别”作为全局设置；当前按人生角色映射视觉角色。

## 视觉角色配置

新增 UI 层视觉配置，避免在组件里散落图片路径和硬编码判断。

角色映射：

- `mom -> xiaobei`
- `programmer -> xiaochuan`
- `student -> xiaochuan`
- `smalltown -> xiaochuan`

视觉状态：

- `default`
- `happy`
- `thinking`
- `shocked`
- `tired`
- `determined`
- `sad`
- `anxious`

资源建议整理到 `public/images/buddies/`，使用 ASCII 文件名，保证 Vite 构建、普通 `<img>` 和 Canvas 加载都稳定：

- `public/images/buddies/xiaobei/default.png`
- `public/images/buddies/xiaobei/happy.png`
- `public/images/buddies/xiaobei/thinking.png`
- `public/images/buddies/xiaobei/shocked.png`
- `public/images/buddies/xiaobei/tired.png`
- `public/images/buddies/xiaobei/determined.png`
- `public/images/buddies/xiaobei/sad.png`
- `public/images/buddies/xiaobei/anxious.png`
- `public/images/buddies/xiaochuan/default.png`
- `public/images/buddies/xiaochuan/happy.png`
- `public/images/buddies/xiaochuan/thinking.png`
- `public/images/buddies/xiaochuan/shocked.png`
- `public/images/buddies/xiaochuan/tired.png`
- `public/images/buddies/xiaochuan/determined.png`
- `public/images/buddies/xiaochuan/sad.png`
- `public/images/buddies/xiaochuan/anxious.png`

`images/小贝.png` 和 `images/小川.png` 是包含设定板的大图，不作为运行时立绘。运行时优先使用单张状态图。

## 状态映射

保留现有 `Emotion = joy | calm | worry | anger | grief`，以及 `baseEmotion(mood)` 和 `pickQuip(...)`。新增视觉状态选择函数，将情绪、心态、是否工作、是否事件爆发和结局等级映射到图片。

常态映射：

- `joy -> happy`
- `calm -> default`
- `worry -> anxious`
- `anger -> shocked`
- `grief -> sad`

工作状态：

- 选择了本周任务且 `mood >= 30` 时，优先显示 `thinking` 或 `determined`。
- 选择了本周任务且 `mood < 30` 时，显示 `tired`。
- 事件爆发期间优先使用事件结果映射，不被工作状态覆盖。

事件爆发：

- 心态上升：`happy`
- 心态小幅下降：`shocked`
- 心态大幅下降：`sad`
- 后续可根据事件池、任务失败或特定事件 id 扩展为 `determined`。

结局卡：

- `S/A -> happy`
- `B -> determined`
- `C -> anxious`
- `D -> sad`

## 组件设计

### `src/ui/buddyVisuals.ts`

新增纯 UI 配置模块：

- 导出 `VisualCharacter`、`BuddyVisualState` 类型。
- 导出 `getVisualCharacter(characterId)`。
- 导出 `getBuddyImage(characterId, visualState)`。
- 导出 `pickBuddyVisualState(...)`。
- 导出开始页头像和结局卡状态选择辅助函数。

这个文件是唯一知道图片路径和角色映射的地方。

### `src/ui/Buddy.tsx`

保留现有情绪 API，替换内部 SVG 为 HTML 2.5D 舞台。

新增 props：

- `characterId: string`
- `mood?: number`
- `burst?: boolean` 或等价上下文

保留 props：

- `emotion`
- `siteLive`
- `working`
- `tier`

舞台元素：

- 背景房间：夜窗、桌面、显示器、绿植/海报/奖杯等收入等级陈设。
- 角色立绘：用状态图，设置固定尺寸、`object-fit: contain`、阴影和 transform。
- 状态动画：呼吸、轻微浮动、工作时轻微前倾、开心弹跳、悲伤下沉、焦虑轻晃。
- 站点在线反馈：显示器 LED 或状态点继续保留。

### `src/ui/StartScreen.tsx`

角色卡头像改为视觉角色头像：

- 未锁定角色显示对应 `default` 头像裁切。
- 锁定角色保留锁图标，同时头像降低亮度或加遮罩。
- 选中角色轻微放大、提亮边框。

### `src/ui/GameScreen.tsx`

主界面改为“每周行动面板”：

- 顶部 HUD：周数、资金、日收入、心态和核心技能条。
- 中部小人舞台：展示 2.5D 小人、当前情绪、短句、站点在线状态。
- 下部行动牌：任务以卡牌形式呈现，保留现有任务数据、精力消耗、成功率和条件禁用逻辑。
- 执行按钮作为“本周结算”主操作，视觉上更像游戏确认按钮。

数据流不变：`eligibleTasks`、`toggleTask`、`submitWeek`、`resolveChoice` 继续承担当前职责。

### 结算与事件弹窗

现有 modal 保留交互结构，但视觉改为剧情卡：

- 周结算展示为“本周回顾”。
- 属性变化以 chip/飘字形式强化。
- 事件池标签保留 daily/fate/wing 的区分，但样式更像剧情牌。
- 关闭后仍触发现有情绪爆发。

### `src/ui/endingCard.ts`

结局分享卡不再把 `Buddy` 渲染成 SVG。改为：

- 根据 `state.characterId` 和结局等级选择 PNG。
- 用 `Image` 加载资源。
- 在 Canvas 中绘制 2.5D 小舞台或角色立绘。
- 图片加载失败时跳过角色绘制，不阻塞出卡。

## 样式方向

整体 UI 继续手机优先，但视觉语言从“网页卡片”调整为“模拟经营游戏界面”：

- HUD 更紧凑，资源数值采用胶囊和进度条。
- 行动牌使用稳定高度，避免选中、禁用、成功率变化导致布局跳动。
- 小人舞台使用深色房间、桌面透视、阴影和局部暖光。
- 避免过度营销感和大面积装饰渐变，保留当前项目的暗色经营氛围。
- 所有按钮和卡牌文字必须在移动端不溢出。

## 错误处理与兼容性

- 若找不到角色映射，默认使用 `xiaochuan`。
- 若某个视觉状态图片缺失，回退到该角色的 `default`。
- 若 Canvas 加载图片失败，结局卡仍正常生成，只缺少角色图。
- 不改变 `GameState` 存档结构，旧存档可继续进入游戏。
- `.superpowers/` 是视觉草图临时目录，不应提交到 git。

## 验证计划

自动验证：

- `npm run build`
- `npm test`
- 如实现改动影响真实浏览器流程，运行 `npm run test:e2e`

手动/浏览器验证：

- 开始页角色卡显示小贝/小川头像，锁定态清晰。
- 进入游戏后主界面展示 HUD、小人舞台、行动牌。
- 选择任务后小人切换工作状态，行动牌选中态明确。
- 周结算和事件结果关闭后，小人按心态变化切换状态。
- 低心态、开心、结局 D 等典型场景能看到不同立绘。
- 结局分享卡能生成并包含对应角色图。
- 移动宽度下文字不溢出，关键操作不被遮挡。

## 后续 3D 升级路径

本轮不做真 3D，但保留升级空间：

- 当前 `buddyVisuals.ts` 把“状态选择”和“渲染介质”解耦。
- 未来若有 GLB/VRM 模型，可新增 `Buddy3D`，复用状态映射。
- 用户设置或实验开关可以在 2.5D PNG 与 Three.js 模型之间切换。
