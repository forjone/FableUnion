// 深度构建·网站分流（PRD 3.6）：由槽位生成一个可下载、可分享的独立 HTML 网页。
// 四种核心功能：画廊（主角游历各世界）/ 故事书（四页迷你绘本）/ 介绍页 / 派对邀请函。
// 页面完全自包含（插画全部内联 SVG），下载后离线可看——“留下真实可用的成品”。

import { characterSVG } from '../art/characters';
import { TONE_LABEL, sceneMeta } from './lexicon';
import { TONE_ACCENT, sketchSVG, themeOf } from './sketch';
import { miniStory } from './story';
import type { SiteSpec, SlotProfile } from './types';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function sceneVariant(profile: SlotProfile, sceneId: string, uid: string): string {
  const p = JSON.parse(JSON.stringify(profile)) as SlotProfile;
  const meta = sceneMeta(sceneId);
  p.scene = { id: meta.id, label: meta.label, emoji: meta.emoji };
  // 网页里的配图是纯“场景 + 主角”插画，不叠加玩法/页面布局层
  p.creation_type = 'game';
  p.mechanic = null;
  p.mechanic_extra = null;
  p.site_kind = null;
  return sketchSVG(p, { quality: 'draft', uid });
}

function gallerySection(spec: SiteSpec, profile: SlotProfile): string {
  const scenes = ['meadow', 'space', 'sea', 'castle', 'candy', 'snow'].filter(
    (s, i, arr) => arr.indexOf(s) === i,
  );
  const cards = scenes
    .map((sceneId, i) => {
      const label = sceneMeta(sceneId).label;
      return `<figure class="card">
        <div class="art">${sceneVariant(profile, sceneId, `g${i}`)}</div>
        <figcaption>${esc(spec.heroLabel)}在${esc(label)}</figcaption>
      </figure>`;
    })
    .join('');
  return `<p class="lead">欢迎来到${esc(spec.heroLabel)}的奇幻画廊，一共 ${scenes.length} 幅作品！</p>
    <div class="grid">${cards}</div>`;
}

function storySection(spec: SiteSpec, profile: SlotProfile): string {
  const pages = miniStory(profile)
    .map(
      (pg, i) => `<section class="page card">
        <div class="art">${sceneVariant(profile, pg.sceneId, `s${i}`)}</div>
        <p class="page-text">${esc(pg.text)}</p>
        <span class="page-no">第 ${i + 1} 页</span>
      </section>`,
    )
    .join('');
  return `<p class="lead">一本关于${esc(spec.heroLabel)}的小小故事书，往下翻吧！</p>
    <div class="pages">${pages}</div>`;
}

function introSection(spec: SiteSpec, profile: SlotProfile): string {
  const facts: [string, string][] = [
    ['我叫', spec.heroLabel],
    ['我住在', profile.scene?.label ?? '大草地'],
    ['我的绝招', profile.key_detail?.label ?? '超级可爱'],
    ['我的性格', TONE_LABEL[spec.tone]],
  ];
  if (profile.companion) facts.push(['我的好朋友', profile.companion.label]);
  const rows = facts
    .map(([k, v]) => `<li><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></li>`)
    .join('');
  return `<div class="card intro-card">
      <div class="art">${sceneVariant(profile, spec.sceneId, 'i0')}</div>
      <ul class="facts">${rows}</ul>
    </div>`;
}

function inviteSection(spec: SiteSpec, profile: SlotProfile): string {
  return `<div class="card invite-card">
      <div class="art">${sceneVariant(profile, spec.sceneId, 'v0')}</div>
      <p class="invite-big">请你来${esc(spec.heroLabel)}的派对！</p>
      <ul class="facts">
        <li><span class="k">时间</span><span class="v">就在今天，马上出发！</span></li>
        <li><span class="k">地点</span><span class="v">${esc(profile.scene?.label ?? '大草地')}</span></li>
        <li><span class="k">记得带上</span><span class="v">你最大的笑容</span></li>
      </ul>
      <button class="rsvp" onclick="alert('太好啦！我们等你哦！')">我一定来！</button>
    </div>`;
}

/** 生成独立 HTML 网页（字符串可直接下载/分享） */
export function buildSiteHTML(spec: SiteSpec, profile: SlotProfile): string {
  const accent = TONE_ACCENT[spec.tone];
  const theme = themeOf(spec.sceneId);
  const body =
    spec.kind === 'gallery' ? gallerySection(spec, profile)
    : spec.kind === 'story' ? storySection(spec, profile)
    : spec.kind === 'intro' ? introSection(spec, profile)
    : inviteSection(spec, profile);

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(spec.title)}</title>
<style>
  * { box-sizing: border-box; margin: 0; }
  body {
    font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif;
    background: linear-gradient(180deg, ${theme.sky[0]}, #FFFBF4 40%);
    color: #3E3128; padding: 28px 16px 60px;
  }
  header { text-align: center; margin-bottom: 26px; }
  .hero-art { width: 130px; margin: 0 auto 6px; animation: bob 2.6s ease-in-out infinite; }
  .hero-art svg { width: 100%; height: auto; }
  h1 { font-size: 34px; letter-spacing: 2px; color: ${accent.banner}; }
  .lead { text-align: center; font-size: 17px; color: #8A7A6E; margin-bottom: 22px; font-weight: 600; }
  main { max-width: 900px; margin: 0 auto; }
  .card {
    background: #fff; border-radius: 24px; overflow: hidden; padding: 12px;
    box-shadow: 0 16px 34px -18px rgba(120,70,30,.45); border: 4px solid ${accent.frame};
  }
  .art svg { width: 100%; height: auto; display: block; border-radius: 14px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 18px; }
  figure.card { transition: transform .15s; }
  figure.card:hover { transform: translateY(-6px) rotate(-.5deg); }
  figcaption { text-align: center; padding: 10px 4px 6px; font-size: 18px; font-weight: 700; }
  .pages { display: flex; flex-direction: column; gap: 22px; max-width: 640px; margin: 0 auto; }
  .page-text { font-size: 19px; line-height: 1.8; padding: 14px 12px 4px; }
  .page-no { display: block; text-align: right; color: #B6A594; font-size: 13px; padding: 0 10px 6px; }
  .intro-card, .invite-card { max-width: 620px; margin: 0 auto; }
  .facts { list-style: none; padding: 14px 10px 6px; display: flex; flex-direction: column; gap: 10px; }
  .facts li { display: flex; gap: 12px; align-items: baseline; font-size: 18px; }
  .facts .k { flex: none; background: ${accent.banner}; color: #fff; border-radius: 10px; padding: 3px 12px; font-size: 14px; font-weight: 700; }
  .facts .v { font-weight: 700; }
  .invite-big { text-align: center; font-size: 27px; font-weight: 900; color: ${accent.banner}; padding: 16px 8px 4px; }
  .rsvp {
    display: block; margin: 14px auto 8px; background: ${accent.banner}; color: #fff; border: none;
    font-size: 20px; font-weight: 800; padding: 13px 40px; border-radius: 18px; cursor: pointer;
    box-shadow: 0 10px 22px -8px ${accent.banner};
  }
  footer { text-align: center; margin-top: 40px; color: #B6A594; font-size: 14px; font-weight: 600; }
  @keyframes bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
</style>
</head>
<body>
<header>
  <div class="hero-art">${characterSVG(spec.heroId, 120, spec.accessory)}</div>
  <h1>${esc(spec.title)}</h1>
</header>
<main>${body}</main>
<footer>✦ 用「小灵造造」做出来的 ✦</footer>
</body>
</html>`;
}
