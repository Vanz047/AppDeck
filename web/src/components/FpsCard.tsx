import { SectionCard } from './layout'
import { useI18n } from '@/hooks/useI18n'
import { Spark } from './Spark'

export interface FpsCardProps {
  /** FPS of focused process; -1 means "not detected". */
  fps: number
  /** Status label from the WS client ('connected' | 'connecting' | 'disconnected'). */
  status?: 'connected' | 'connecting' | 'disconnected'
  /** Rolling history for the spark chart; last point is the live value. */
  spark?: number[]
}

/** Returns the display string for FPS: actual value when > 0, otherwise "—". */
export function fpsValue(fps: number): string {
  return fps > 0 ? String(fps) : '—'
}

export function FpsCard({ fps, status, spark = [] }: FpsCardProps) {
  const { t } = useI18n()

  const statusLabel = status === 'connected' ? '●' : status === 'connecting' ? '◐' : '○'
  const statusColor =
    status === 'connected'
      ? 'text-green'
      : status === 'connecting'
        ? 'text-yellow'
        : 'text-muted'

  return (
    <SectionCard title={t('activeWindow')}>
      <div className="flex flex-col items-center py-4 gap-3">
        <div className="flex items-center gap-2">
          <span className={`text-lg ${statusColor}`}>{statusLabel}</span>
          <span
            className="text-[11px] px-3 py-1 rounded-full bg-panel-3 border border-border text-muted"
            data-testid="fps-status-badge"
          >
            {t('activeWindow')}
          </span>
        </div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted">
          {t('fps')}
        </div>
        <div className="text-7xl font-extrabold text-green leading-none" data-testid="fps-value">
          {fpsValue(fps)}
        </div>
        <div className="text-sm text-muted">Active Window</div>
        {spark.length > 0 && (
          <div className="w-full mt-2">
            <div className="text-[10px] text-muted mb-1">{t('realTimeFps')}</div>
            <Spark points={spark} color="var(--green)" w={120} />
            <div className="flex justify-between text-[9px] text-muted mt-1">
              <span>-60s</span>
              <span>{t('agora')}</span>
            </div>
          </div>
        )}
        <div className="w-full grid grid-cols-3 gap-2 mt-3">
          {[
            [t('minLabel'), '—'],
            [t('avgLabel'), '—'],
            [t('maxLabel'), '—'],
          ].map(([l]) => (
            <div key={String(l)} className="text-center bg-panel-3 border border-border rounded-xl py-2">
              <div className="text-[10px] text-muted">{l}</div>
              <div className="text-lg font-bold">—</div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  )
}
