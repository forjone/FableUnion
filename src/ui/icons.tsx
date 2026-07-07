/**
 * 统一图标系统：24×24 线性图标（stroke 风格）。
 * 内容层的 icon 字段填这里的名字；React 界面用 <Icon/>，
 * Canvas 结局卡直接用 ICON_PATHS 以 Path2D 绘制，两端视觉一致。
 */

export const ICON_PATHS: Record<string, string[]> = {
  // 属性
  cash: ['M2 7h20v10H2z', 'M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z', 'M5 10v.01M19 14v.01'],
  energy: ['M13 2 3 14h7l-1 8 10-12h-7l1-8z'],
  mood: [
    'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z',
  ],
  income: ['M23 6l-9.5 9.5-5-5L1 18', 'M17 6h6v6'],
  dev: ['M16 18l6-6-6-6', 'M8 6l-6 6 6 6'],
  seo: ['M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z', 'M21 21l-4.35-4.35'],
  eng: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M2 12h20', 'M12 2a15.3 15.3 0 0 1 0 20a15.3 15.3 0 0 1 0-20z'],
  product: [
    'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
    'M3.27 6.96 12 12.01l8.73-5.05',
    'M12 22.08V12',
  ],
  sparkle: ['M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z'],

  // 任务
  chart: ['M18 20V10', 'M12 20V4', 'M6 20v-6'],
  key: [
    'M13.4 11.6a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78z',
    'M13.4 11.6 21 4',
    'M18 7l3 3',
  ],
  rocket: [
    'M12 15l-3-3a22 22 0 0 1 2-4A12.9 12.9 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z',
    'M9 12H5s.55-3.03 2-4c1.62-1.08 4 0 4 0',
    'M12 15v4s3.03-.55 4-2c1.08-1.62 0-4 0-4',
    'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2',
  ],
  pen: ['M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z'],
  link: [
    'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71',
    'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  ],
  card: ['M1 5h22v14H1z', 'M1 10h22'],
  wrench: [
    'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  ],
  megaphone: ['M3 11l18-5v12L3 14v-3z', 'M11.6 16.8a3 3 0 1 1-5.8-1.6'],
  briefcase: ['M2 7h20v14H2z', 'M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16'],
  book: ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'],
  moon: ['M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'],

  // 角色 / 其他
  compass: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z'],
  trophy: [
    'M8 21h8',
    'M12 17v4',
    'M7 4h10v6a5 5 0 0 1-10 0V4z',
    'M7 6H5a2 2 0 0 0 0 4h2',
    'M17 6h2a2 2 0 0 1 0 4h-2',
  ],
  flag: ['M4 22V4', 'M4 4c6-3 10 3 16 0v11c-6 3-10-3-16 0'],
  settings: ['M4 21v-7', 'M4 10V3', 'M12 21v-9', 'M12 8V3', 'M20 21v-5', 'M20 12V3', 'M1 14h6', 'M9 8h6', 'M17 16h6'],
  skull: ['M12 2a9 9 0 0 0-9 9c0 3.6 2 6.4 5 7.9V22h8v-3.1c3-1.5 5-4.3 5-7.9a9 9 0 0 0-9-9z', 'M9 13v.01M15 13v.01'],
}

export function Icon(props: {
  name: string
  size?: number
  strokeWidth?: number
  className?: string
}) {
  const paths = ICON_PATHS[props.name]
  if (!paths) return null
  const size = props.size ?? 16
  return (
    <svg
      className={props.className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={props.strokeWidth ?? 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}

/** 在 Canvas 上绘制同一套图标 */
export function drawIcon(
  ctx: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  size: number,
  color: string,
  strokeWidth = 2,
): void {
  const paths = ICON_PATHS[name]
  if (!paths) return
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(size / 24, size / 24)
  ctx.strokeStyle = color
  ctx.lineWidth = strokeWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const d of paths) ctx.stroke(new Path2D(d))
  ctx.restore()
}
