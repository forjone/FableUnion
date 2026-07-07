import type { StatDef } from '../engine/types'

export function formatStat(def: StatDef | undefined, value: number): string {
  if (!def) return String(Math.round(value))
  const unit = def.unit ?? ''
  switch (def.format) {
    case 'money':
      return `${unit}${Math.round(value).toLocaleString()}`
    case 'decimal':
      return `${unit}${value >= 100 ? Math.round(value).toLocaleString() : value.toFixed(2)}`
    default:
      return `${unit}${Math.round(value)}`
  }
}
