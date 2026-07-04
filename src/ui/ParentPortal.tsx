// 家长门户（PRD 第 5 节）：PIN 保护，可查看生成记录 / 安全日志 / 成功指标，
// 并管理 AI 配置、年龄档位与本地数据。孩子界面永不出现这些内容。

import { useState } from 'react';
import { imgGenReady, type ImgGenConfig } from '../app/imagegen';
import { metricsSummary } from '../app/metrics';
import { clearAllLocalData, loadSafetyLog } from '../app/safety';
import type { WorkRecord } from '../engine/types';

export type AgeTier = 'young' | 'old';

const PIN_KEY = 'fable.pin';

function loadPin(): string | null {
  try { return localStorage.getItem(PIN_KEY); } catch { return null; }
}

function savePin(pin: string) {
  try { localStorage.setItem(PIN_KEY, pin); } catch { /* ignore */ }
}

type Tab = 'settings' | 'records' | 'safety' | 'metrics';

export function ParentPortal(props: {
  cfg: ImgGenConfig;
  tier: AgeTier;
  works: WorkRecord[];
  devInfo: string;
  onSaveCfg: (cfg: ImgGenConfig) => void;
  onTier: (t: AgeTier) => void;
  onClose: () => void;
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [tab, setTab] = useState<Tab>('settings');
  const existingPin = loadPin();

  const tryUnlock = () => {
    if (existingPin === null) {
      if (/^\d{4}$/.test(pinInput)) { savePin(pinInput); setUnlocked(true); }
      else setPinError(true);
    } else if (pinInput === existingPin) {
      setUnlocked(true);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  return (
    <div className="portal-backdrop" onClick={props.onClose}>
      <div className="portal" onClick={(e) => e.stopPropagation()}>
        <div className="portal-head">
          <span className="portal-title">家长小屋</span>
          <button className="portal-close" type="button" onClick={props.onClose}>关闭</button>
        </div>

        {!unlocked ? (
          <div className="pin-gate">
            <p className="pin-tip">
              {existingPin === null ? '第一次使用，请设置一个 4 位家长密码' : '请输入家长密码'}
            </p>
            <input
              className="pin-input"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinInput}
              autoFocus
              onChange={(e) => { setPinInput(e.target.value.replace(/\D/g, '')); setPinError(false); }}
              onKeyDown={(e) => { if (e.key === 'Enter') tryUnlock(); }}
            />
            {pinError && <p className="pin-error">{existingPin === null ? '请输入 4 位数字' : '密码不对哦'}</p>}
            <button className="settings-save" type="button" onClick={tryUnlock}>
              {existingPin === null ? '设置密码' : '进入'}
            </button>
          </div>
        ) : (
          <>
            <div className="portal-tabs">
              {([
                ['settings', '设置'], ['records', '生成记录'], ['safety', '安全日志'], ['metrics', '指标'],
              ] as [Tab, string][]).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`portal-tab ${tab === id ? 'on' : ''}`}
                  onClick={() => setTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="portal-body">
              {tab === 'settings' && (
                <SettingsTab cfg={props.cfg} tier={props.tier} onSaveCfg={props.onSaveCfg} onTier={props.onTier} />
              )}
              {tab === 'records' && <RecordsTab works={props.works} devInfo={props.devInfo} />}
              {tab === 'safety' && <SafetyTab />}
              {tab === 'metrics' && <MetricsTab />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SettingsTab(props: {
  cfg: ImgGenConfig;
  tier: AgeTier;
  onSaveCfg: (cfg: ImgGenConfig) => void;
  onTier: (t: AgeTier) => void;
}) {
  const [draft, setDraft] = useState(props.cfg);
  const [saved, setSaved] = useState(false);
  const set = (patch: Partial<ImgGenConfig>) => { setDraft((d) => ({ ...d, ...patch })); setSaved(false); };
  const status = !draft.enabled
    ? 'AI 已关闭：终稿使用小灵手绘图'
    : imgGenReady(draft)
      ? draft.baseUrl === 'mock' ? '演示模式：不发请求，用手绘图模拟 AI 上色' : '已配置：确认页会后台生成 AI 魔法图'
      : '未填 API Key：终稿使用小灵手绘图';
  return (
    <div>
      <div className="settings-title">年龄档位（PRD 交互分层）</div>
      <div className="settings-row tier-row">
        <label><input type="radio" checked={props.tier === 'young'} onChange={() => props.onTier('young')} /> 低龄档 4–6 岁（纯图形，不依赖识字）</label>
        <label><input type="radio" checked={props.tier === 'old'} onChange={() => props.onTier('old')} /> 高龄档 7–10 岁（图形 + 简单文字）</label>
      </div>

      <div className="settings-title">AI 魔法图（图片生成）</div>
      <label className="settings-row">
        <input type="checkbox" checked={draft.enabled} onChange={(e) => set({ enabled: e.target.checked })} />
        启用（确认页后台生成终稿插画，失败自动回退手绘图）
      </label>
      <label className="settings-row"><span>API 地址</span>
        <input type="text" value={draft.baseUrl} placeholder="/imggen/v1 或 mock" onChange={(e) => set({ baseUrl: e.target.value.trim() })} />
      </label>
      <label className="settings-row"><span>API Key</span>
        <input type="password" value={draft.apiKey} placeholder="sk-…" onChange={(e) => set({ apiKey: e.target.value })} />
      </label>
      <label className="settings-row"><span>图片模型</span>
        <input type="text" value={draft.model} onChange={(e) => set({ model: e.target.value.trim() })} />
      </label>

      <div className="settings-title">AI 语义理解（听懂更复杂的话）</div>
      <label className="settings-row">
        <input type="checkbox" checked={draft.llmEnabled} onChange={(e) => set({ llmEnabled: e.target.checked })} />
        启用（用大模型归一孩子的话再拆解；失败自动用内置规则引擎）
      </label>
      <label className="settings-row"><span>语言模型</span>
        <input type="text" value={draft.llmModel} onChange={(e) => set({ llmModel: e.target.value.trim() })} />
      </label>

      <div className="settings-actions">
        <button className="settings-save" type="button" onClick={() => { props.onSaveCfg(draft); setSaved(true); }}>
          {saved ? '已保存 ✓' : '保存'}
        </button>
        <span className="settings-status">{status}</span>
      </div>

      <div className="settings-title">数据与隐私</div>
      <p className="privacy-note">
        所有数据（作品、对话、日志、密码、API Key）只保存在本机浏览器里，不上传任何服务器。
        语音识别由浏览器完成，本应用不保存录音。
      </p>
      <button
        className="danger-btn"
        type="button"
        onClick={() => {
          if (window.confirm('确定清空本机的全部作品、记录与设置吗？此操作不可恢复。')) {
            clearAllLocalData();
            window.location.reload();
          }
        }}
      >
        清空本机全部数据
      </button>
    </div>
  );
}

function RecordsTab(props: { works: WorkRecord[]; devInfo: string }) {
  return (
    <div>
      <div className="settings-title">当前会话</div>
      <pre className="settings-json">{props.devInfo}</pre>
      <div className="settings-title">作品档案（{props.works.length}）</div>
      {props.works.length === 0 && <p className="privacy-note">还没有作品。</p>}
      {props.works.map((w) => (
        <details key={w.id} className="record-item">
          <summary>
            {w.title}
            <span className="record-time">{new Date(w.updatedAt).toLocaleString('zh-CN')}</span>
          </summary>
          <pre className="settings-json">{JSON.stringify(w.slots, null, 2)}</pre>
          <div className="record-dialogue">
            {(w.dialogue ?? []).map((d, i) => (
              <p key={i} className={`record-line ${d.who}`}>
                <b>{d.who === 'kid' ? '孩子' : '小灵'}</b>
                {d.text}
              </p>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

function SafetyTab() {
  const log = loadSafetyLog();
  return (
    <div>
      <div className="settings-title">安全日志（输入拦截，{log.length} 条）</div>
      {log.length === 0 && <p className="privacy-note">没有拦截记录，一切安好。</p>}
      {log.map((e, i) => (
        <div key={i} className="record-item safety-item">
          <span className="safety-label">{e.label}</span>
          <span className="record-time">{new Date(e.at).toLocaleString('zh-CN')}</span>
          <p className="record-line kid">{e.text}</p>
        </div>
      ))}
    </div>
  );
}

function MetricsTab() {
  return (
    <div>
      <div className="settings-title">成功指标（PRD 第 8 节，本机统计）</div>
      {metricsSummary().map((m) => (
        <div key={m.label} className="metric-row">
          <span>{m.label}</span>
          <b>{m.value}</b>
        </div>
      ))}
    </div>
  );
}
