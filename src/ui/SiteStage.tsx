// ⑤ 成品展示 · 网站类作品：iframe 预览 + 下载成 HTML 文件（真实可留存的成品）。

import { useMemo, useState } from 'react';
import { IconHome, IconMic, IconSparkle } from '../art/icons';
import { buildSiteHTML } from '../engine/website';
import type { SiteSpec, SlotProfile } from '../engine/types';

export function SiteStage(props: {
  spec: SiteSpec;
  profile: SlotProfile;
  onIterate: () => void;
  onHome: () => void;
}) {
  const html = useMemo(() => buildSiteHTML(props.spec, props.profile), [props.spec, props.profile]);
  const [downloaded, setDownloaded] = useState(false);

  const download = () => {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${props.spec.title}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    setDownloaded(true);
  };

  return (
    <div className="stage-play">
      <div className="play-head">
        <h2 className="play-title">{props.spec.title}</h2>
        <span className="done-chip">造好啦</span>
      </div>
      <iframe className="site-frame" title={props.spec.title} srcDoc={html} sandbox="allow-scripts" />
      <div className="play-controls">
        <button className="btn-action blue" type="button" onClick={download}>
          <IconSparkle size={24} />
          <span className="t-label">{downloaded ? '已保存 ✓' : '保存网页'}</span>
        </button>
        <span className="ctl-divider" aria-hidden />
        <button className="btn-outline" type="button" onClick={props.onIterate}>
          <IconMic size={22} />
          <span className="t-label">还想加点什么</span>
        </button>
        <button className="btn-action ghost" type="button" onClick={props.onHome}>
          <IconHome size={22} />
          <span className="t-label">收好</span>
        </button>
      </div>
      <p className="soft-hint">保存下来的网页可以发给家人朋友，打开就能看！</p>
    </div>
  );
}
