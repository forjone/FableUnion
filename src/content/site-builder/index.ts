import type { LifePack } from '../../engine/types'
import { characters, milestones, stats, tasks, turnEffects } from './base'
import { dailyEvents } from './events-daily'
import { fateEvents } from './events-fate'
import { wingEvents } from './events-wing'
import { endings } from './endings'

/** 人生包 #1：出海建站 */
export const siteBuilderPack: LifePack = {
  id: 'site-builder',
  name: '出海建站人生',
  tagline: '从日入一刀到工资自由，一段真实的出海心路。',
  turnUnit: '周',
  maxTurns: 104,
  stats,
  energyStat: { id: 'energy', perTurn: 10 },
  chartStat: 'income',
  turnEffects,
  characters,
  tasks,
  events: [...dailyEvents, ...fateEvents, ...wingEvents],
  milestones,
  endings,
  wingChance: 0.12,
}
