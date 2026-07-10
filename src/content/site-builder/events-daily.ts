import type { EventCard } from '../../engine/types'

/** 日常池：小额波动，构成生活的底色 */
export const dailyEvents: EventCard[] = [
  {
    id: 'thanksEmail',
    pool: 'daily',
    title: '一封感谢邮件',
    text: '收件箱里躺着一封陌生用户的邮件："Your site saved my day. Thank you."',
    valence: 1,
    cooldown: 8,
    conditions: { flag: 'siteLive', is: true },
    choices: [
      {
        text: '反复读了三遍',
        effects: [{ stat: 'mood', add: 5 }],
        resultText: '就为这一句话，这几个月都值了。',
      },
    ],
  },
  {
    id: 'serverDown',
    pool: 'daily',
    title: '服务器宕机',
    text: [
      { text: '凌晨两点，监控告警把你吵醒：网站挂了。', conditions: { count: 'event.serverDown', lte: 0 } },
      { text: '熟悉的告警声又响了。你叹了口气，闭着眼都知道该先查哪个服务。', conditions: { count: 'event.serverDown', gte: 1 } },
    ],
    valence: -1,
    cooldown: 10,
    conditions: { flag: 'siteLive', is: true },
    choices: [
      {
        text: '爬起来修',
        effects: [{ stat: 'mood', add: -3 }, { stat: 'dev', add: 1 }],
        resultText: [
          { text: '折腾到四点恢复了。你顺手给自己加了个自动重启脚本。', conditions: { count: 'event.serverDown', lte: 1 } },
          { text: '五分钟定位，十分钟恢复，顺手补了条告警规则。熟练得让人心疼。', conditions: { count: 'event.serverDown', gte: 2 } },
        ],
      },
      {
        text: '睡醒再说',
        effects: [{ stat: 'mood', add: -2 }, { stat: 'income', mul: 0.97 }],
        resultText: '早上修好了。掉的那点流量，就当交学费。',
      },
    ],
  },
  {
    id: 'domainRenewal',
    pool: 'daily',
    title: '域名续费涨价',
    text: '注册商发来邮件：明年续费价格上调。',
    valence: -1,
    cooldown: 20,
    conditions: { flag: 'siteLive', is: true },
    choices: [
      {
        text: '续，这是我的地盘',
        effects: [{ stat: 'cash', add: -120 }],
        resultText: '交完钱你嘀咕：等我做大了，第一件事是囤十年。',
      },
    ],
  },
  {
    id: 'exColleague',
    pool: 'daily',
    title: '前同事的朋友圈',
    text: [
      { text: '刷到前同事晒工牌：他升 P7 了，配文「感恩团队」。', conditions: { stat: 'income', lte: 0.99 } },
      { text: '前同事又晒了年终奖截图。你看了看自己后台里那几美元——各有各的活法吧。', conditions: { stat: 'income', gte: 1, lte: 9.99 } },
      { text: '前同事晒出升职朋友圈。你笑着点了个赞——你现在的收入曲线，已经不需要和任何人比较了。', conditions: { stat: 'income', gte: 10 } },
    ],
    valence: -1,
    cooldown: 12,
    characters: ['programmer'],
    choices: [
      {
        text: '点个赞，继续写代码',
        effects: [{ stat: 'mood', add: -4 }],
        resultText: [
          { text: '你盯着自己后台里可怜的日收入，深吸了一口气。', conditions: { stat: 'income', lte: 9.99 } },
          { text: '你平静地关掉朋友圈，继续写代码。风水轮流转这件事，不必说出口。', conditions: { stat: 'income', gte: 10 } },
        ],
      },
      {
        text: '屏蔽朋友圈一个月',
        effects: [{ stat: 'mood', add: 2 }],
        resultText: '眼不见心不烦。你的对手从来不是他。',
      },
    ],
  },
  {
    id: 'twitterRich',
    pool: 'daily',
    title: '别人的日入千刀',
    text: [
      { text: '推特上又有人晒图：一个比你的站丑十倍的工具，MRR $30k。', conditions: { stat: 'income', lte: 0.99 } },
      { text: '又刷到同行晒 MRR。这次你注意到的不是数字，而是他的定价策略。', conditions: { stat: 'income', gte: 1 } },
    ],
    valence: 0,
    cooldown: 10,
    choices: [
      {
        text: '酸了，真的酸了',
        effects: [{ stat: 'mood', add: -4 }],
        resultText: '你截图存进了「凭什么」文件夹。里面已经有 47 张图。',
      },
      {
        text: '拆解他为什么能成',
        conditions: { stat: 'mood', gte: 30 },
        effects: [{ stat: 'product', add: 2 }, { stat: 'mood', add: 2 }],
        resultText: '拆完发现：人家赢在选品。你默默打开了需求分析笔记。',
      },
    ],
  },
  {
    id: 'firstFeedback',
    pool: 'daily',
    title: '第一条用户反馈',
    text: '有人在你的站上提交了反馈表单——虽然内容是报 bug。',
    valence: 1,
    once: true,
    conditions: { flag: 'siteLive', is: true },
    choices: [
      {
        text: '连夜修复并回复',
        effects: [{ stat: 'mood', add: 6 }, { stat: 'product', add: 2 }],
        resultText: '对方回了句 "wow that was fast"。你笑出了声。',
      },
    ],
  },
  {
    id: 'renovation',
    pool: 'daily',
    title: '楼上装修',
    text: '电钻声从早上八点准时响起，你的专注力碎了一地。',
    valence: -1,
    cooldown: 15,
    choices: [
      {
        text: '戴上耳机硬扛',
        effects: [{ stat: 'mood', add: -3 }],
        resultText: '白噪音开到最大。你想起了以前公司的静音舱。',
      },
      {
        text: '去咖啡店办公',
        effects: [{ stat: 'cash', add: -100 }, { stat: 'mood', add: 1 }],
        resultText: '一杯 32 块的拿铁，买了一下午安静。',
      },
    ],
  },
  {
    id: 'githubStar',
    pool: 'daily',
    title: '涨了一颗 Star',
    text: '你开源的小工具今天多了一颗 star，来自一个陌生的老外。',
    valence: 1,
    cooldown: 8,
    choices: [
      {
        text: '点开他的主页看了看',
        effects: [{ stat: 'mood', add: 3 }],
        resultText: '世界的另一头有人用你写的东西。这感觉很奇妙。',
      },
    ],
  },
  {
    id: 'weakRival',
    pool: 'daily',
    title: '竞品翻车',
    text: '你研究的一个竞品站好几天打不开了，看起来是弃坑了。',
    valence: 1,
    cooldown: 20,
    conditions: { flag: 'siteLive', is: true },
    choices: [
      {
        text: '接住它的流量',
        effects: [{ stat: 'income', add: 0.05, mul: 1.08 }, { stat: 'mood', add: 3 }],
        resultText: '你补了几篇它排名最好的主题。剩者为王。',
      },
    ],
  },
  {
    id: 'oldFriends',
    pool: 'daily',
    title: '老友聚会',
    text: '大学室友群里喊你周末聚餐。你上次见他们还是离职前。',
    valence: 0,
    cooldown: 16,
    choices: [
      {
        text: '去，人不能只有事业',
        effects: [{ stat: 'cash', add: -300 }, { stat: 'mood', add: 6 }],
        resultText: [
          { text: '被问「最近在忙啥」的时候你犹豫了一下，还是说了实话。他们没笑。', conditions: { stat: 'income', lte: 9.99 } },
          { text: '被问「在忙啥」，你直接打开后台给他们看。桌上安静了几秒，然后全是「卧槽牛逼」。', conditions: { stat: 'income', gte: 10 } },
        ],
      },
      {
        text: '不去，省钱赶进度',
        effects: [{ stat: 'mood', add: -3 }],
        resultText: '你回了个「下次一定」。群里安静了几秒。',
      },
    ],
  },
  {
    id: 'insomnia',
    pool: 'daily',
    title: '失眠',
    text: [
      { text: '凌晨三点，天花板上全是没做完的待办和没赚到的钱。', conditions: { stat: 'mood', lte: 35 } },
      { text: '凌晨三点，你睁着眼睛在算：存款还能撑几个月。', conditions: { all: [{ stat: 'mood', gte: 36 }, { stat: 'income', lte: 9.99 }] } },
      { text: '凌晨三点醒来，你习惯性摸过手机看了眼海外订单——有三单。你笑了一下，翻身睡去。', conditions: { stat: 'income', gte: 10 } },
    ],
    valence: -1,
    cooldown: 9,
    choices: [
      {
        text: '起来看后台数据',
        effects: [{ stat: 'mood', add: -3 }],
        resultText: [
          { text: '数据没变。你看了半小时，像看一口不会开的锅。', conditions: { stat: 'income', lte: 9.99 } },
          { text: '看着缓缓上涨的曲线，你反而安心地困了。就是明早会后悔现在没睡。', conditions: { stat: 'income', gte: 10 } },
        ],
      },
    ],
  },
  {
    id: 'utilities',
    pool: 'daily',
    title: '账单日',
    text: '水电网费一起到期，支付宝的提醒比闹钟还准时。',
    valence: -1,
    cooldown: 13,
    choices: [
      {
        text: '交',
        effects: [{ stat: 'cash', add: -260 }],
        resultText: '自由职业的「自由」，不包括不交账单的自由。',
      },
    ],
  },
  {
    id: 'smallTip',
    pool: 'daily',
    title: '有人请你喝咖啡',
    text: '网站角落的「Buy me a coffee」按钮，今天真的有人点了。',
    valence: 1,
    cooldown: 10,
    conditions: { all: [{ flag: 'siteLive', is: true }, { stat: 'income', gt: 0 }] },
    choices: [
      {
        text: '$5，收下了',
        effects: [{ stat: 'cash', add: 35 }, { stat: 'mood', add: 5 }],
        resultText: '这大概是你喝过最提神的一杯咖啡，虽然你没喝到。',
      },
    ],
  },
  {
    id: 'communityPost',
    pool: 'daily',
    title: '社群里的干货帖',
    text: '出海社群里有人分享了一套「程序化 SEO」的完整打法。',
    valence: 1,
    cooldown: 9,
    choices: [
      {
        text: '逐字读完，做笔记',
        effects: [{ stat: 'seo', add: 2 }, { stat: 'mood', add: 2 }],
        resultText: '信息差就是钱。你把帖子加了星标。',
      },
    ],
  },
  {
    id: 'keyboardBroken',
    pool: 'daily',
    title: '键盘罢工',
    text: '陪你写了几万行代码的键盘，空格键失灵了。',
    valence: -1,
    cooldown: 30,
    choices: [
      {
        text: '换新的，生产力工具不能省',
        effects: [{ stat: 'cash', add: -500 }, { stat: 'mood', add: 2 }],
        resultText: '新键盘手感清脆。写 bug 的速度都变快了。',
      },
      {
        text: '拆开修修凑合用',
        effects: [{ stat: 'mood', add: -2 }, { stat: 'dev', add: 1 }],
        resultText: '修好了。你顺便学会了热插拔轴体，谜之成就感。',
      },
    ],
  },
  {
    id: 'momCall',
    pool: 'daily',
    title: '妈妈的电话',
    text: [
      { text: '「工作顺利吗？」妈妈的声音一如既往。你还没告诉她你辞职了。', conditions: { flag: 'familyKnows', is: false } },
      { text: '「你那个网站怎么样了？」妈妈现在会主动问了，虽然她还是说不清你在做什么。', conditions: { flag: 'familyKnows', is: true } },
    ],
    valence: 0,
    cooldown: 12,
    characters: ['programmer'],
    choices: [
      {
        text: '说实话',
        effects: [{ flag: 'familyKnows', value: true }, { stat: 'mood', add: -3 }],
        resultText: '电话那头沉默了很久，最后说：「钱不够了跟家里说。」你的鼻子有点酸。',
      },
      {
        text: '「挺好的，在忙一个大项目」',
        effects: [{ stat: 'mood', add: -5 }],
        resultText: '也不算撒谎。这确实是你人生里最大的项目。',
      },
    ],
  },
  {
    id: 'indexRecovered',
    pool: 'daily',
    title: '收录回来了',
    text: '掉了两周的收录量今天突然恢复,曲线重新抬头。',
    valence: 1,
    cooldown: 14,
    conditions: { flag: 'siteLive', is: true },
    choices: [
      {
        text: '虚惊一场',
        effects: [{ stat: 'mood', add: 4 }],
        resultText: '做站就是这样：大部分的坏消息，熬一熬就过去了。',
      },
    ],
  },
  {
    id: 'newbieDm',
    pool: 'daily',
    title: '新人来请教',
    text: '一个刚入坑的网友私信你：「大佬，可以请教一下怎么开始吗？」',
    valence: 1,
    cooldown: 12,
    conditions: { flag: 'siteLive', is: true },
    choices: [
      {
        text: '认真写了长长的回复',
        effects: [{ stat: 'mood', add: 3 }, { stat: 'product', add: 1 }],
        resultText: '教是最好的学。写着写着，你把自己的思路也理清了。',
      },
      {
        text: '丢给他一个帖子链接',
        effects: [{ stat: 'mood', add: -1 }],
        resultText: '你实在没精力了。希望他能理解。',
      },
    ],
  },
  {
    id: 'rainWalk',
    pool: 'daily',
    title: '雨天散步',
    text: '写不动了。窗外在下雨，你决定出去走走。',
    valence: 1,
    cooldown: 11,
    choices: [
      {
        text: '淋一点雨也无所谓',
        effects: [{ stat: 'mood', add: 5 }],
        resultText: '走到第三个路口，卡了三天的问题突然有了答案。',
      },
    ],
  },
  {
    id: 'aiTools',
    pool: 'daily',
    title: 'AI 又出新模型了',
    text: '时间线被新模型刷屏：「一句话生成整站」。评论区都在喊独立开发要死了。',
    valence: 0,
    cooldown: 15,
    choices: [
      {
        text: '焦虑三分钟，然后用它干活',
        effects: [{ stat: 'dev', add: 2 }, { stat: 'mood', add: 1 }],
        resultText: '工具越强，会用工具的人越值钱。你的效率翻了一倍。',
      },
      {
        text: '不看了，做好手里的事',
        effects: [{ stat: 'mood', add: 2 }],
        resultText: '风浪越大鱼越贵，浪头过去，还在打鱼的人才有鱼。',
      },
    ],
  },
]
