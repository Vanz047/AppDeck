import { SectionCard } from './layout'
import { useI18n } from '@/hooks/useI18n'
import { Spark } from './Spark'

export interface CpuCardProps {
  /** CPU usage percentage (0-100). */
  cpuPct: number
  /** Rolling history for the spark chart; last point is the live value. */
  spark?: number[]
}

export function CpuCard({ cpuPct, spark = [] }: CpuCardProps) {
  const { t } = useI18n()

  return (
    <SectionCard title={t('processor')}>
      <div
        className="bg-panel-3 border border-border rounded-2xl p-4 flex flex-col gap-2"
        style={{ color: 'var(--accent)' }}
      >
        <div className="text-sm font-semibold text-text/90">CPU</div>
        <div className="flex items-end gap-1">
          <span className="text-4xl font-extrabold leading-none">{Math.round(cpuPct)}</span>
          <span className="text-xs font-bold text-muted mb-1">%</span>
        </div>
        <div className="text-[11px] text-muted">
          Freq: <b>&mdash;</b> &middot; Temp: <b>&mdash;</b>
        </div>
        {spark.length > 0 && (
          <div className="w-full mt-1">
            <Spark points={spark} color="var(--accent)" />
          </div>
        )}
      </div>
    </SectionCard>
  )
}
