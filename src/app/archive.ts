// 作品档案（PRD 3.7）：槽位 JSON + 对话历史 + 构建产物参数，全部本地持久化。
// V3 的家长层可直接读取这份档案（含 PRD 第 6 节格式的槽位 JSON）。

import { slotsToJSON } from '../engine/parser';
import type { DialogueEntry, GameSpec, SlotProfile, WorkRecord } from '../engine/types';

const KEY = 'fable.works';

export function loadWorks(): WorkRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as WorkRecord[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function persist(list: WorkRecord[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, 30))); } catch { /* 存不下就算了 */ }
}

export function saveWork(
  existingId: string | null,
  title: string,
  profile: SlotProfile,
  spec: GameSpec,
  dialogue: DialogueEntry[],
  coverUrl?: string | null,
): WorkRecord {
  const list = loadWorks();
  const now = Date.now();
  const found = existingId ? list.find((w) => w.id === existingId) : undefined;
  if (found) {
    found.title = title;
    found.updatedAt = now;
    found.profile = profile;
    found.slots = slotsToJSON(profile);
    found.spec = spec;
    found.dialogue = dialogue;
    if (coverUrl !== undefined) found.coverUrl = coverUrl;
    persist([found, ...list.filter((w) => w.id !== found.id)]);
    return found;
  }
  const rec: WorkRecord = {
    id: `w${now.toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`,
    title,
    createdAt: now,
    updatedAt: now,
    slots: slotsToJSON(profile),
    profile,
    spec,
    dialogue,
    coverUrl: coverUrl ?? null,
  };
  persist([rec, ...list]);
  return rec;
}
