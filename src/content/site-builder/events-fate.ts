import type { EventCard } from '../../engine/types'

/** 命运池：中等冲击，多带抉择 */
export const fateEvents: EventCard[] = [
  {
    id: 'googleUpdate',
    pool: 'fate',
    title: 'Google 核心算法更新',
    text: '半夜社群炸了：Google 推送核心更新。你打开后台，流量曲线像被人踩了一脚。',
    valence: -1,
    cooldown: 20,
    conditions: { all: [{ flag: 'siteLive', is: true }, { stat: 'income', gte: 0.5 }] },
    choices: [
      {
        text: '熬夜逐页分析，对着更新公告改站',
        effects: [
          { stat: 'seo', add: 4 },
          { stat: 'income', mul: 0.8 },
          { stat: 'mood', add: -5 },
        ],
        resultText: '三天没怎么睡。流量止住了下滑，你对算法的理解上了一个台阶。',
      },
      {
        text: '摆烂，等它自己恢复',
        effects: [{ stat: 'income', mul: 0.55 }, { stat: 'mood', add: -8 }],
        resultText: '两周后流量稳住了，但只剩一半。有些坑，躲是躲不过去的。',
      },
    ],
  },
  {
    id: 'adsenseBan',
    pool: 'fate',
    title: 'AdSense 风暴',
    text: '邮件标题让你手心出汗：「您的账号存在无效流量风险」。广告收入被暂停了。',
    valence: -1,
    once: true,
    conditions: { all: [{ flag: 'adsense', is: true }, { stat: 'income', gte: 2 }] },
    choices: [
      {
        text: '写申诉信，逐条自证清白',
        effects: [
          { stat: 'income', mul: 0.6 },
          { stat: 'mood', add: -10 },
          { stat: 'eng', add: 2 },
        ],
        resultText: '一个月后账号解封了，但你明白了一个道理：收入不能吊在一棵树上。',
      },
      {
        text: '不等了，转投其他广告联盟',
        effects: [{ stat: 'income', mul: 0.75 }, { stat: 'mood', add: -6 }],
        resultText: '单价低了点，但睡得着了。鸡蛋分篮子放，是用惨痛学费换来的。',
      },
    ],
  },
  {
    id: 'bigCorpClone',
    pool: 'fate',
    title: '大厂下场了',
    text: '某大厂发布了和你功能几乎一样的免费工具，配着铺天盖地的推广。',
    valence: -1,
    once: true,
    conditions: { stat: 'income', gte: 1 },
    choices: [
      {
        text: '差异化死磕：做它不屑做的细分',
        effects: [
          { stat: 'income', mul: 0.7 },
          { stat: 'product', add: 5 },
          { stat: 'mood', add: -4 },
        ],
        resultText: '大厂要的是大盘，你要的是缝隙。三个月后，你的细分用户反而更铁了。',
      },
      {
        text: '认清现实，转做新需求',
        effects: [
          { stat: 'income', mul: 0.5 },
          { flag: 'didResearch', value: true },
          { stat: 'mood', add: -6 },
        ],
        resultText: '砍掉旧功能那天你有点难受。但船小好调头，本来就是你唯一的优势。',
      },
    ],
  },
  {
    id: 'familyDoubt',
    pool: 'fate',
    title: '饭桌上的质问',
    text: '过节回家，亲戚当着全家的面问：「一天到晚对着电脑，一个月挣多少钱啊？」',
    valence: -1,
    cooldown: 25,
    characters: ['programmer'],
    choices: [
      {
        text: '打开后台，给他们看真实数据',
        conditions: { stat: 'income', gte: 1 },
        effects: [{ flag: 'familyKnows', value: true }, { stat: 'mood', add: 6 }],
        resultText: '「这是美元。」饭桌上安静了三秒。妈妈虽然没说话，但给你夹了块排骨。',
      },
      {
        text: '笑笑不说话',
        effects: [{ stat: 'mood', add: -7 }],
        resultText: '你把没说出口的话咽了下去，就着一碗白饭。总有一天会有答案的。',
      },
    ],
  },
  {
    id: 'socialInsurance',
    pool: 'fate',
    title: '自由的价格',
    text: '社保断缴提醒。原来公司帮你交的那部分，现在要自己扛了。',
    valence: -1,
    cooldown: 26,
    characters: ['programmer'],
    choices: [
      {
        text: '自己续上，安全感要紧',
        effects: [{ stat: 'cash', add: -1600 }, { stat: 'mood', add: -2 }],
        resultText: '交完这笔钱，你才真正理解「裸辞」这两个字里那个「裸」。',
      },
      {
        text: '先断几个月，把钱留给项目',
        effects: [{ stat: 'mood', add: -5 }],
        resultText: '你安慰自己：最大的保障不是社保，是把事做成。',
      },
    ],
  },
  {
    id: 'copyrightLetter',
    pool: 'fate',
    title: '一封律师函',
    text: '你随手用的一张配图，被图库公司盯上了。邮件措辞冰冷，索赔金额惊人。',
    valence: -1,
    once: true,
    conditions: { flag: 'siteLive', is: true },
    choices: [
      {
        text: '立刻删图、道歉、协商',
        effects: [{ stat: 'cash', add: -800 }, { stat: 'mood', add: -5 }],
        resultText: '最后小额和解。当晚你把全站图片换成了自己截的图。',
      },
      {
        text: '查清楚再说，别被吓住',
        effects: [{ stat: 'mood', add: -3 }, { stat: 'product', add: 2 }],
        resultText: '研究后发现是广撒网的钓鱼函。你顺手给网站加了一套合规检查清单。',
      },
    ],
  },
  {
    id: 'offerBack',
    pool: 'fate',
    title: '回去的门还开着',
    text: '前领导发来消息：「组里缺人，待遇比你走的时候好，回来吗？」',
    valence: 0,
    cooldown: 30,
    conditions: { turn: { gte: 13 } },
    characters: ['programmer'],
    choices: [
      {
        text: '谢绝。这条路还没走完',
        effects: [{ stat: 'mood', add: 4 }, { flag: 'determined', value: true }],
        resultText: '按下发送键的瞬间，你反而轻松了。退路关上,前面才是路。',
      },
      {
        text: '心动了，纠结了一整晚',
        effects: [{ stat: 'mood', add: -6 }],
        resultText: '你最终没回消息。但那晚之后，后台数据每一次波动都变得更刺眼了。',
      },
      {
        text: '接受。这段旅程到此为止',
        effects: [{ flag: 'backToJob', value: true }],
        resultText: '你合上电脑，给自己的网站截了最后一张图。',
      },
    ],
  },
  {
    id: 'sickWeek',
    pool: 'fate',
    title: '病倒了',
    text: '连续熬夜之后，身体先罢工了。高烧、浑身酸痛，你在床上躺了四天。',
    valence: -1,
    cooldown: 22,
    choices: [
      {
        text: '好好养病，别硬撑',
        effects: [{ stat: 'cash', add: -600 }, { stat: 'mood', add: -4 }],
        resultText: '病好那天你想通了：身体才是独立开发者唯一的固定资产。',
      },
    ],
  },
  {
    id: 'ddos',
    pool: 'fate',
    title: '被攻击了',
    text: '网站被莫名其妙地打了一波流量攻击，服务器账单开始飙升。',
    valence: -1,
    once: true,
    conditions: { all: [{ flag: 'siteLive', is: true }, { stat: 'income', gte: 1 }] },
    choices: [
      {
        text: '上 CDN 防护，花钱消灾',
        effects: [{ stat: 'cash', add: -400 }, { stat: 'dev', add: 2 }],
        resultText: '折腾一天配置好了防护。被攻击说明你有价值了——你这样安慰自己。',
      },
      {
        text: '硬扛，攻击总会停的',
        effects: [{ stat: 'income', mul: 0.85 }, { stat: 'mood', add: -5 }],
        resultText: '三天后攻击停了，掉了一些用户。有些钱，真的不能省。',
      },
    ],
  },
  {
    id: 'harshReview',
    pool: 'fate',
    title: '一篇长文差评',
    text: '有用户写了篇千字长文吐槽你的产品，条条戳心，还发在了论坛上。',
    valence: -1,
    cooldown: 25,
    conditions: { flag: 'siteLive', is: true },
    choices: [
      {
        text: '逐条回应，当场改进',
        effects: [{ stat: 'product', add: 4 }, { stat: 'mood', add: -3 }],
        resultText: '你在帖子下面认真回复了。一周后，那位用户成了你最活跃的反馈者。',
      },
      {
        text: '破防了，关掉页面',
        effects: [{ stat: 'mood', add: -7 }],
        resultText: '那篇帖子你后来又偷偷看了五遍。其实……他说得对。',
      },
    ],
  },
  {
    id: 'payoutFrozen',
    pool: 'fate',
    title: '提现被冻结',
    text: '支付平台风控误判,这个月的收入提现被冻结审核，客服只会说 sorry。',
    valence: -1,
    once: true,
    conditions: { stat: 'income', gte: 3 },
    choices: [
      {
        text: '按流程提交材料，耐心等',
        effects: [{ stat: 'mood', add: -6 }],
        resultText: '两周后钱到账了。你开始认真研究多平台收款方案。',
      },
      {
        text: '发推 @官方 讨说法',
        effects: [{ stat: 'mood', add: -3 }, { flag: 'vocal', value: true }],
        resultText: '帖子小火了一把，官方加急处理了。会哭的孩子有奶吃，但你不想总靠哭。',
      },
    ],
  },
  {
    id: 'rentUp',
    pool: 'fate',
    title: '房东的消息',
    text: '「兄弟，下个季度房租要涨 15%，市场价你懂的。」',
    valence: -1,
    once: true,
    conditions: { turn: { gte: 20 } },
    choices: [
      {
        text: '搬去更便宜的地方',
        effects: [{ stat: 'cash', add: -1000 }, { stat: 'mood', add: -3 }],
        resultText: '搬家折腾了一周。新房间小了五平米，但窗外有棵树。',
      },
      {
        text: '认了，懒得折腾',
        effects: [{ stat: 'cash', add: -1500 }],
        resultText: '你多接了点活把差价补上。成年人的字典里，「稳定」都是有价格的。',
      },
    ],
  },
]
