import { SectionCard } from './layout'
import { useI18n } from '@/hooks/useI18n'
import { Spark } from './Spark'

export interface RamCardProps {
  /** RAM usage percentage (0-100). */
  ramPct: number
  /** Used RAM in GB. */
  ramUsedGB: number
  /** Rolling history for the spark chart; last point is the live value. */
  spark?: number[]
}

export function RamCard({ ramPct, ramUsedGB, spark = [] }: RamCardProps) {
  const { t } = useI18n()

  return (
    <SectionCard title={t('memory')}>
      <div
        className="bg-panel-3 border border-border rounded-2xl p-4 flex flex-col gap-2"
        style={{ color: 'var(--green)' }}
      >
        <div className="text-sm font-semibold text-text/90">RAM</div>
        <div className="flex items-end gap-1">
          <span className="text-4xl font-extrabold leading-none">{Math.round(ramPct)}</span>
          <span className="text-xs font-bold text-muted mb-1">%</span>
        </div>
        <div className="text-[11px] text-muted">
          {ramUsedGB.toFixed(1)} GB used
        </div>
        {spark.length > 0 && (
          <div className="w-full mt-1">
            <Spark points={spark} color="var(--green)" />
          </div>
        )}
      </div>
    </SectionCard>
  )
}
