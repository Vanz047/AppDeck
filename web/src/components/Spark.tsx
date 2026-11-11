// Shared SVG sparkline used by CpuCard / RamCard / FpsCard.
// Takes a flat array of numbers; the last value is the most recent sample.
export interface SparkProps {
  points: number[]
  color?: string
  w?: number
  h?: number
}

export function Spark({
  points,
  color = 'var(--accent)',
  w = 100,
  h = 36,
}: SparkProps) {
  if (points.length === 0) return null
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const step = w / (points.length - 1)
  const d = points
    .map((p, i) => {
      const x = i * step
      const y = h - ((p - min) / range) * (h - 6) - 3
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-9" aria-hidden="true">
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
