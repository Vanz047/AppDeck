import type { ReactNode } from 'react'
import { SectionCard } from '../layout'
import { useI18n } from '@/hooks/useI18n'
import { useAppDeckWS } from '@/ws'
import { CpuCard } from '@/components/CpuCard'
import { RamCard } from '@/components/RamCard'
import { FpsCard } from '@/components/FpsCard'
import { Spark } from '@/components/Spark'

function PCard({
  name,
  value,
  unit,
  meta,
  spark,
  color,
}: {
  name: string
  value: string
  unit: string
  meta: ReactNode
  spark: number[]
  color: string
}) {
  return (
    <div className="bg-panel-3 border border-border rounded-2xl p-4 flex flex-col gap-2" style={{ color }}>
      <div className="text-sm font-semibold text-text/90">{name}</div>
      <div className="flex items-end gap-1">
        <span className="text-4xl font-extrabold leading-none" style={{ color }}>
          {value}
        </span>
        <span className="text-xs font-bold text-muted mb-1">{unit}</span>
      </div>
      <div className="text-[11px] text-muted">{meta}</div>
      <Spark points={spark} color={color} />
    </div>
  )
}

function Gauge({ pct, label, usage }: { pct: number; label: string; usage: string }) {
  const r = 30
  const c = 2 * Math.PI * r
  const offset = c * (1 - pct / 100)
  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-panel-3 border border-border rounded-2xl">
      <svg viewBox="0 0 80 80" className="w-16 h-16 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#1f1f2e" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="6"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="text-lg font-bold -mt-9">{pct}%</div>
      <div className="text-xs font-semibold text-text">{label}</div>
      <div className="text-[10px] text-muted">{usage}</div>
    </div>
  )
}

export function PerfTab() {
  const { t } = useI18n()
  const { metrics, status } = useAppDeckWS()

  // Fallback static data when disconnected
  const cpuPct = metrics?.cpu ?? 0
  const ramPct = metrics?.ram ?? 0
  const ramUsedGB = metrics?.ramUsedGB ?? 0
  const fps = metrics?.fps ?? 0
  const timestamp = metrics?.timestamp ?? ''

  // Build spark history from metrics (in a real app, you'd maintain a rolling buffer)
  const cpuSpark = [30, 35, 42, 38, 45, 50, 48, 55, 42, cpuPct]
  const gpuSpark = [60, 70, 75, 78, 82, 79, 76, 80, 78, 74]
  const ramSpark = [55, 58, 62, 60, 64, 61, 59, 63, 61, ramPct]
  const netSpark = [2.0, 2.6, 2.2, 2.8, 2.4, 2.1, 2.5, 2.3, 2.6, 2.4]
  const fpsSpark = [89, 120, 110, 135, 128, 150, 142, 138, 158, fps || 144]

  const statusLabel = status === 'connected' ? '●' : status === 'connecting' ? '◐' : '○'
  const statusColor = status === 'connected' ? 'text-green' : status === 'connecting' ? 'text-yellow' : 'text-muted'

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Coluna esquerda: CPU + GPU + Armazenamento */}
      <div className="flex flex-col gap-4">
        <CpuCard cpuPct={cpuPct} spark={cpuSpark} />
        <SectionCard title={t('gpu')}>
          <PCard
            name="GPU"
            value="—"
            unit="%"
            meta={<>VRAM: <b>—</b> · Power: <b>—</b></>}
            spark={gpuSpark}
            color="var(--blue)"
          />
        </SectionCard>
        <SectionCard title={t('storage')}>
          <div className="grid grid-cols-3 gap-2">
            <Gauge pct={48} label="C:\ Sistema" usage="247 / 512 GB" />
            <Gauge pct={60} label="D:\ Dados" usage="1.2 / 2 TB" />
            <Gauge pct={75} label="E:\ Backup" usage="375 / 500 GB" />
          </div>
        </SectionCard>
      </div>

      {/* Coluna central: FPS */}
      <FpsCard fps={fps} status={status} spark={fpsSpark} />

      {/* Coluna direita: RAM + Rede + Energia */}
      <div className="flex flex-col gap-4">
        <RamCard ramPct={ramPct} ramUsedGB={ramUsedGB} spark={ramSpark} />
        <SectionCard title={t('network')}>
          <PCard
            name="Network"
            value="—"
            unit="Mb/s"
            meta={<>↑ <b>—</b></>}
            spark={netSpark}
            color="var(--cyan)"
          />
        </SectionCard>
        <SectionCard title={t('power')}>
          <div className="flex flex-col gap-2">
            <div className="flex items-end gap-1">
              <span className="text-4xl font-extrabold text-accent leading-none">—</span>
              <span className="text-xs font-bold text-muted mb-1">W</span>
            </div>
            <div className="h-2 rounded-full bg-panel-3 overflow-hidden">
              <div className="h-full bg-accent" style={{ width: '0%' }} />
            </div>
            <div className="text-[11px] text-muted">{t('pcUptime')} <b>—</b> · {t('session')} <b>—</b></div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
