import type { Character, Effect, Milestone, StatDef, Task } from '../../engine/types'

export const stats: StatDef[] = [
  { id: 'cash', name: '资金', icon: 'cash', format: 'money', unit: '¥' },
  { id: 'energy', name: '精力', icon: 'energy', min: 0, max: 10, format: 'int' },
  { id: 'mood', name: '心态', icon: 'mood', min: 0, max: 100, format: 'int' },
  { id: 'income', name: '日收入', icon: 'income', min: 0, format: 'decimal', unit: '$' },
  { id: 'dev', name: '编程', icon: 'dev', min: 0, max: 100, format: 'int' },
  { id: 'seo', name: 'SEO', icon: 'seo', min: 0, max: 100, format: 'int' },
  { id: 'eng', name: '英语', icon: 'eng', min: 0, max: 100, format: 'int' },
  { id: 'product', name: '产品', icon: 'product', min: 0, max: 100, format: 'int' },
  { id: 'polish', name: '打磨度', icon: 'sparkle', min: 0, hidden: true },
]

/** 每周结算：收入入账（$→¥ 按 7 汇率 × 7 天 = ×49），生活开销 ¥800 */
export const turnEffects: Effect[] = [
  { stat: 'cash', addFromStat: { stat: 'income', mul: 49 } },
  { stat: 'cash', add: -800 },
]

export const characters: Character[] = [
  {
    id: 'programmer',
    name: '大厂裸辞程序员',
    icon: 'dev',
    tagline: '存款在倒计时，梦想在跑马灯。',
    desc: '干了七年，P6+。上周提了离职，HR 问你想清楚没有。你有一笔存款、一身代码功夫，和一个「做个自己的产品」的执念。',
    initialStats: { cash: 30000, mood: 70, income: 0, dev: 65, seo: 10, eng: 40, product: 30 },
  },
  {
    id: 'mom',
    name: '时间管理宝妈',
    icon: 'mood',
    tagline: '每天真正属于自己的时间，是娃睡着以后。',
    desc: '生娃前你是运营主管，现在你的日程表属于一个两岁的小朋友。你想在碎片时间里，给自己挣回一个名字。精力随娃的状态大起大落，但你比谁都会挤时间。',
    initialStats: { cash: 15000, mood: 65, income: 0, dev: 20, seo: 15, eng: 30, product: 45 },
    energy: { base: 7, variance: 3 },
    turnEffects: [
      { stat: 'cash', addFromStat: { stat: 'income', mul: 49 } },
      { stat: 'cash', add: -500 },
    ],
    unlock: { type: 'runs', value: 1, hint: '完整走完一段人生后解锁' },
  },
  {
    id: 'student',
    name: '在校学生党',
    icon: 'book',
    tagline: '没钱，但有的是时间和白嫖额度。',
    desc: '大三，计算机系，绩点不上不下。你在宿舍熄灯后用学生优惠白嫖了一整套云服务，英语六级刚过——你想在毕业前，先给自己挣出一条不用投简历的路。',
    initialStats: { cash: 5000, mood: 75, income: 0, dev: 40, seo: 5, eng: 60, product: 20 },
    turnEffects: [
      { stat: 'cash', addFromStat: { stat: 'income', mul: 49 } },
      { stat: 'cash', add: -350 },
    ],
    unlock: { type: 'milestone', value: 'oneDollar', hint: '在任意人生达成「日入一刀」后解锁' },
  },
  {
    id: 'smalltown',
    name: '五线小城青年',
    icon: 'compass',
    tagline: '这座城市没人聊出海，所以你只能一个人先出发。',
    desc: '县城，二十六岁，在亲戚眼里你是「在家玩电脑的」。这里生活成本低到离谱，也安静到离谱。你什么都不太会，但你有大把的时间，和一股不服气。',
    initialStats: { cash: 12000, mood: 70, income: 0, dev: 30, seo: 20, eng: 15, product: 25 },
    turnEffects: [
      { stat: 'cash', addFromStat: { stat: 'income', mul: 49 } },
      { stat: 'cash', add: -400 },
    ],
    unlock: { type: 'grade', value: 'B', hint: '达成 B 级以上结局后解锁' },
  },
]

export const tasks: Task[] = [
  {
    id: 'research',
    name: '需求分析',
    icon: 'chart',
    desc: '刷论坛、看搜索词、翻竞品，寻找值得做的需求。做过需求分析的人，才接得住风口。',
    energyCost: 2,
    baseSuccess: 1,
    success: {
      effects: [{ stat: 'product', add: 2 }, { flag: 'didResearch', value: true }],
      log: [
        { text: '你翻了一晚上搜索需求词，笔记记了七页。', conditions: { count: 'task.research', lte: 2 } },
        { text: '扫一眼榜单，你已经能估出七成需求的成色。嗅觉是这样练出来的。', conditions: { count: 'task.research', gte: 3 } },
      ],
    },
  },
  {
    id: 'keyword',
    name: '关键词调研',
    icon: 'key',
    desc: '用工具挖长尾词，找竞争低、流量稳的切入点。上站前的必修课。',
    energyCost: 2,
    baseSuccess: 1,
    success: {
      effects: [{ stat: 'seo', add: 2 }, { flag: 'keywordsDone', value: true }],
      log: [
        { text: '挖到了几个 KD 低得可疑的词，心跳有点加速。', conditions: { count: 'task.keyword', lte: 2 } },
        { text: '工具还没跑完，你已经手动猜中了一半好词。', conditions: { count: 'task.keyword', gte: 3 } },
      ],
    },
  },
  {
    id: 'launch',
    name: '上站！',
    icon: 'rocket',
    desc: '买域名、搭站、提交收录。从这一刻起，你在互联网上有了一块自己的地。',
    energyCost: 4,
    once: true,
    conditions: { flag: 'keywordsDone', is: true },
    baseSuccess: 1,
    success: {
      effects: [
        { flag: 'siteLive', value: true },
        { stat: 'cash', add: -600 },
        { stat: 'product', add: 2 },
        { stat: 'mood', add: 6 },
      ],
      log: '网站上线了。你盯着那个只有你自己访问的首页，看了很久。',
    },
  },
  {
    id: 'content',
    name: '写内容',
    icon: 'pen',
    desc: '围绕关键词持续产出内容，喂饱搜索引擎。',
    energyCost: 3,
    conditions: { flag: 'siteLive', is: true },
    baseSuccess: 0.55,
    successBonus: [{ stat: 'seo', factor: 0.004 }],
    success: {
      effects: [{ stat: 'income', addRange: [0.05, 0.4] }, { stat: 'seo', add: 1 }],
      log: [
        { text: '新内容被收录了，曲线往上抬了一点点。', conditions: { count: 'task.content.ok', lte: 2 } },
        { text: '写得越来越顺手了，两个小时就能出一篇像样的。', conditions: { count: 'task.content.ok', gte: 3, lte: 9 } },
        { text: '选题、大纲、成稿一气呵成。你已经有了自己的内容方法论。', conditions: { count: 'task.content.ok', gte: 10 } },
      ],
    },
    fail: {
      effects: [{ stat: 'mood', add: -2 }],
      log: [
        { text: '写了三篇，没有一篇被收录。', conditions: { count: 'task.content', lte: 3 } },
        { text: '又是石沉大海的一周。但你已经学会不为单周数据情绪化了。', conditions: { count: 'task.content', gte: 4 } },
      ],
    },
    mastery: [
      {
        count: 10,
        log: '质变 · 内容流水线成型——十篇内容沉淀成一套模板，产出效率上了一个台阶。',
        effects: [{ stat: 'seo', add: 3 }, { stat: 'product', add: 2 }],
      },
      {
        count: 25,
        log: '质变 · 老内容开始互相引流，你的站长成了一张内容网络。',
        effects: [{ stat: 'income', add: 0.5 }, { stat: 'mood', add: 4 }],
      },
    ],
  },
  {
    id: 'backlink',
    name: '加外链',
    icon: 'link',
    desc: '给站长们发邮件求外链。被拒是常态，脸皮是耗材。',
    energyCost: 2,
    conditions: { flag: 'siteLive', is: true },
    baseSuccess: 0.3,
    successBonus: [
      { stat: 'eng', factor: 0.003 },
      { stat: 'seo', factor: 0.003 },
    ],
    success: {
      effects: [{ stat: 'seo', add: 2 }, { stat: 'income', add: 0.02, mul: 1.06 }],
      log: [
        { text: '一个 DR60 的站挂上了你的链接，权重肉眼可见地动了。', conditions: { count: 'task.backlink.ok', lte: 2 } },
        { text: '回复率上来了——你的外链邮件已经写出了肌肉记忆。', conditions: { count: 'task.backlink.ok', gte: 3 } },
      ],
    },
    fail: {
      effects: [{ stat: 'mood', add: -3 }],
      log: [
        { text: '发了 20 封外链邮件，全部石沉大海。', conditions: { count: 'task.backlink', lte: 2 } },
        { text: '又被拒了。你把拒信拖进文件夹，那里已经攒了厚厚一沓。', conditions: { count: 'task.backlink', gte: 3, lte: 7 } },
        { text: '再次被拒。你面无表情地点开下一个站长的邮箱——脸皮这层装备早就满级了。', conditions: { count: 'task.backlink', gte: 8 } },
      ],
    },
    mastery: [
      {
        count: 8,
        log: '质变 · 你总结出一套外链话术模板，从开场白到跟进节奏都有了章法。',
        effects: [{ stat: 'eng', add: 2 }, { stat: 'seo', add: 3 }],
      },
    ],
  },
  {
    id: 'adsense',
    name: '接入广告',
    icon: 'card',
    desc: '申请 AdSense，让流量开始变成钱。',
    energyCost: 2,
    cooldown: 2,
    conditions: { all: [{ flag: 'siteLive', is: true }, { flag: 'adsense', is: false }] },
    baseSuccess: 0.7,
    success: {
      effects: [{ flag: 'adsense', value: true }, { stat: 'income', addRange: [0.05, 0.3] }],
      log: '广告审核通过了！页面上出现了第一条广告，丑，但可爱。',
    },
    fail: {
      effects: [{ stat: 'mood', add: -4 }],
      log: '广告审核被拒：「内容价值不足」。这五个字你看了十遍。',
    },
  },
  {
    id: 'polish',
    name: '打磨产品',
    icon: 'wrench',
    desc: '改交互、提速度、抠细节。打磨过的产品，才配得上被大 V 看见。',
    energyCost: 3,
    conditions: { flag: 'siteLive', is: true },
    baseSuccess: 1,
    success: {
      effects: [{ stat: 'product', add: 3 }, { stat: 'polish', add: 1 }],
      log: [
        { text: '重构了首屏，加载快了一秒。没人会注意到，但你知道。', conditions: { count: 'task.polish.ok', lte: 2 } },
        { text: '细节抠到了像素级。用户说不出哪里好，只说「用起来很舒服」。', conditions: { count: 'task.polish.ok', gte: 3 } },
      ],
    },
    mastery: [
      {
        count: 6,
        log: '质变 · 产品气质成型——那种「被认真做过」的质感，已经藏不住了。',
        effects: [{ stat: 'product', add: 5 }, { stat: 'mood', add: 4 }],
      },
    ],
  },
  {
    id: 'producthunt',
    name: '发布 Product Hunt',
    icon: 'megaphone',
    desc: '一年只有一次首发机会，冲一波海外曝光。',
    energyCost: 3,
    once: true,
    conditions: { all: [{ flag: 'siteLive', is: true }, { stat: 'product', gte: 40 }] },
    baseSuccess: 0.4,
    successBonus: [{ stat: 'product', factor: 0.004 }],
    success: {
      effects: [{ stat: 'income', add: 0.5, mul: 1.5 }, { stat: 'mood', add: 10 }],
      log: '冲上了 PH 当日前十！通知响了一整夜，你舍不得静音。',
    },
    fail: {
      effects: [{ stat: 'mood', add: -5 }],
      log: '帖子沉了。3 个赞，其中一个是你自己点的。',
    },
  },
  {
    id: 'freelance',
    name: '接私活',
    icon: 'briefcase',
    desc: '用老本行换现金流，给梦想续命。',
    energyCost: 3,
    cooldown: 2,
    baseSuccess: 1,
    success: {
      effects: [{ stat: 'cash', addRange: [1500, 3500] }, { stat: 'mood', add: -3 }],
      log: [
        { text: '私活的钱到账了。但你很清楚，这不是你辞职的原因。', conditions: { count: 'task.freelance.ok', lte: 1 } },
        { text: '轻车熟路地交付了。你开始挑单子做，时薪悄悄涨了三成。', conditions: { count: 'task.freelance.ok', gte: 2, lte: 4 } },
        { text: '老客户直接打款预定了下个月。讽刺的是，你的「副业」比上班稳定多了。', conditions: { count: 'task.freelance.ok', gte: 5 } },
      ],
    },
    mastery: [
      {
        count: 5,
        log: '质变 · 接活口碑立住了，从此单价上了一个台阶。',
        effects: [{ stat: 'cash', add: 1000 }],
      },
    ],
  },
  {
    id: 'learnEng',
    name: '练英语',
    icon: 'eng',
    desc: '出海人的第二母语,外链邮件和老外用户都靠它。',
    energyCost: 2,
    baseSuccess: 1,
    success: {
      effects: [{ stat: 'eng', add: 3 }],
      log: [
        { text: '跟读了一周播客，梦里都在 sorry for the late reply。', conditions: { stat: 'eng', lte: 40 } },
        { text: '给老外用户回邮件不用查词典了，连语气词都用得地道起来。', conditions: { stat: 'eng', gte: 41, lte: 70 } },
        { text: '你在英文社区的回帖被顶上高赞，有人问你是不是 native speaker。', conditions: { stat: 'eng', gte: 71 } },
      ],
    },
  },
  {
    id: 'learnSeo',
    name: '研究 SEO',
    icon: 'book',
    desc: '算法在变，认知要跟上。',
    energyCost: 2,
    baseSuccess: 1,
    success: {
      effects: [{ stat: 'seo', add: 3 }],
      log: [
        { text: '啃完一篇万字长文，感觉离 Google 又近了一点。', conditions: { stat: 'seo', lte: 30 } },
        { text: '现在读算法分析文章，你已经能看出作者哪一段在瞎猜了。', conditions: { stat: 'seo', gte: 31, lte: 60 } },
        { text: '新出的案例研究里，有一半结论你半年前就亲手验证过了。', conditions: { stat: 'seo', gte: 61 } },
      ],
    },
  },
  {
    id: 'rest',
    name: '休息充电',
    icon: 'moon',
    desc: '死磕不是唯一的路。会休息的人才走得远。',
    energyCost: 2,
    baseSuccess: 1,
    success: {
      effects: [{ stat: 'mood', add: 8 }],
      log: [
        { text: '睡了整整两天。醒来时窗外有鸟叫，你很久没注意过这个声音了。', conditions: { stat: 'mood', lte: 30 } },
        { text: '状态正好，这次休息更像犒赏。你陪自己看了场电影。', conditions: { stat: 'mood', gte: 70 } },
        { text: '关掉电脑，好好睡了两天。世界没有塌。', conditions: { stat: 'mood', gte: 31, lte: 69 } },
      ],
    },
  },
]

export const milestones: Milestone[] = [
  {
    id: 'firstCent',
    stat: 'income',
    gte: 0.01,
    title: '第一刀最难',
    text: '你赚到了互联网上的第一分钱。金额不重要，跑通了才重要。',
    effects: [{ stat: 'mood', add: 10 }],
  },
  {
    id: 'oneDollar',
    stat: 'income',
    gte: 1,
    title: '日入一刀，人生分界线',
    text: '从今天起，你是「有收入的独立开发者」了。',
    effects: [{ stat: 'mood', add: 8 }],
  },
  {
    id: 'tenDollars',
    stat: 'income',
    gte: 10,
    title: '奶茶自由',
    text: '每天睁眼十刀。你开始理解什么叫「睡后收入」。',
    effects: [{ stat: 'mood', add: 8 }],
  },
  {
    id: 'hundredDollars',
    stat: 'income',
    gte: 100,
    title: '工资自由',
    text: '日入百刀，超过了上班的日薪。当初的决定，对了。',
    effects: [{ stat: 'mood', add: 10 }],
  },
  {
    id: 'thousandDollars',
    stat: 'income',
    gte: 1000,
    title: '传说中的那个人',
    text: '日入千刀。你成了社群里别人转述的故事。',
    effects: [{ stat: 'mood', add: 15 }],
  },
]
