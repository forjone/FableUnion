import type { EventCard } from '../../engine/types'

/**
 * 银翅膀池（风口卡）：稀有机会，需要前置条件才接得住。
 * 错过时明确告知玩家错过了什么——遗憾也是心路历程的一部分。
 */
export const wingEvents: EventCard[] = [
  {
    id: 'bigVRetweet',
    pool: 'wing',
    title: '大 V 的目光',
    text: '一位十万粉的出海大 V 偶然点开了你的站,他的手指悬在「转发」上。',
    valence: 1,
    once: true,
    conditions: { flag: 'siteLive', is: true },
    wingCatch: {
      conditions: { stat: 'polish', gte: 3 },
      missText: '他点进来,首屏加载了八秒,他关掉了页面。机会只敲一次门,而你的产品还没准备好。',
      missEffects: [{ stat: 'mood', add: -3 }],
    },
    choices: [
      {
        text: '接住这波流量！',
        effects: [
          { stat: 'income', add: 0.5, mul: 3 },
          { stat: 'mood', add: 15 },
          { flag: 'famous', value: true },
        ],
        resultText: '转发配文：「这个小工具打磨得真用心。」一夜之间,你的曲线变成了一堵墙。',
      },
    ],
  },
  {
    id: 'trendWave',
    pool: 'wing',
    title: '风口来了',
    text: '一个新需求在海外社交平台突然爆发,搜索量一天翻了五十倍。',
    valence: 1,
    cooldown: 45,
    conditions: { flag: 'siteLive', is: true },
    wingCatch: {
      conditions: { flag: 'didResearch', is: true },
      missText: '等你从别人的复盘帖里知道这个风口时,红利期已经过去了。平时不做需求分析的人,看不见正在起风。',
      missEffects: [{ stat: 'mood', add: -4 }],
    },
    choices: [
      {
        text: '连夜上线针对性页面',
        effects: [{ stat: 'income', add: 1, mul: 1.5 }, { stat: 'mood', add: 10 }],
        resultText: '因为一直在跟踪需求,你比大部队早了整整五天。这五天就是全部的胜负。',
      },
      {
        text: '风口太吵,继续做自己的事',
        effects: [{ stat: 'mood', add: 2 }],
        resultText: '不是每阵风都要追。你关掉热榜,继续打磨手里的东西。',
      },
    ],
  },
  {
    id: 'acquisitionOffer',
    pool: 'wing',
    title: '收购邀约',
    text: '一封来自海外买家的邮件：「我们关注你的站很久了,愿意出一笔不错的价格。」',
    valence: 1,
    once: true,
    conditions: { flag: 'siteLive', is: true },
    wingCatch: {
      conditions: { stat: 'income', gte: 15 },
      missText: '对方看了眼你的收入数据,礼貌地没有再回复。想被收购,先得值得被收购。',
      missEffects: [{ stat: 'mood', add: -2 }],
    },
    choices: [
      {
        text: '卖！落袋为安',
        effects: [{ stat: 'cash', add: 90000 }, { flag: 'soldSite', value: true }],
        resultText: '签完协议那晚,你翻出了第一次部署失败的截图。原来已经走了这么远。',
      },
      {
        text: '不卖,它还能长大',
        effects: [{ stat: 'mood', add: 6 }, { flag: 'ambitious', value: true }],
        resultText: '你回了一句 "Not for sale, but thanks."。有些东西的价值,报价单衡量不了。',
      },
    ],
  },
  {
    id: 'algoBonus',
    pool: 'wing',
    title: '算法的馈赠',
    text: 'Google 这次更新罕见地偏爱小站,你的几个核心词排名一夜起飞。',
    valence: 1,
    once: true,
    conditions: { all: [{ flag: 'siteLive', is: true }, { stat: 'income', gt: 0 }] },
    wingCatch: {
      conditions: { stat: 'seo', gte: 45 },
      missText: '别人的站起飞了,你的站原地不动。红利只分给准备好的站——你的内功还不够。',
      missEffects: [{ stat: 'mood', add: -3 }],
    },
    choices: [
      {
        text: '乘胜追击,加固排名',
        effects: [{ stat: 'income', mul: 2 }, { stat: 'mood', add: 12 }],
        resultText: '几年 SEO 的基本功,在这一晚全部兑现。你截图发了社群:「熬住,都会有的。」',
      },
    ],
  },
  {
    id: 'podcastInvite',
    pool: 'wing',
    title: '播客邀请',
    text: '一档小有名气的独立开发播客发来邀请,想聊聊你的出海故事。',
    valence: 1,
    once: true,
    conditions: { flag: 'siteLive', is: true },
    wingCatch: {
      conditions: { any: [{ flag: 'famous', is: true }, { stat: 'income', gte: 10 }] },
      missText: '主播翻了翻你的数据,委婉地说「等你再做出些成绩我们再约」。故事要有数字才动听,这很现实。',
      missEffects: [{ stat: 'mood', add: -2 }],
    },
    choices: [
      {
        text: '把这一路的坑都讲出来',
        effects: [{ stat: 'income', mul: 1.3 }, { stat: 'mood', add: 10 }],
        resultText: '节目上线后,后台涌进一批新用户。评论区最高赞:「听哭了,这就是我的现在。」',
      },
    ],
  },
  {
    id: 'foreignPartner',
    pool: 'wing',
    title: '大洋彼岸的握手',
    text: '一位海外开发者发来长邮件:他有渠道和本地化资源,想和你合伙把站做进他的市场。',
    valence: 1,
    once: true,
    conditions: { all: [{ flag: 'siteLive', is: true }, { stat: 'income', gte: 1 }] },
    wingCatch: {
      conditions: { stat: 'eng', gte: 55 },
      missText: '视频会议上你磕磕绊绊,想说的话卡在喉咙里。对方礼貌收场。你第一次恨自己当年没好好上英语课。',
      missEffects: [{ stat: 'mood', add: -4 }, { stat: 'eng', add: 2 }],
    },
    choices: [
      {
        text: '合作,把站推向新市场',
        effects: [{ stat: 'income', mul: 1.6 }, { flag: 'partner', value: true }, { stat: 'mood', add: 8 }],
        resultText: '三个月后,你的收入曲线上多了一种新的颜色:来自另一个时区的订单。',
      },
      {
        text: '婉拒,独木桥走到底',
        effects: [{ stat: 'mood', add: 2 }],
        resultText: '你喜欢一个人的节奏。也许错过了什么,但你心里踏实。',
      },
    ],
  },
]
