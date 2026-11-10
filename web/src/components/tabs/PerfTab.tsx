import { SectionCard } from '../layout'
import { useI18n } from '@/hooks/useI18n'

// Dados estáticos enquanto o WS da T4.2 não chega — mesma forma do
// mockup. O `Metrics` do `shared` alimenta isto depois.
function Spark({
  points,
  color = 'var(--accent)',
  w = 100,
  h = 36,
}: {
  points: number[]
  color?: string
  w?: number
  h?: number
}) {
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
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-9">
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

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
  meta: string
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
      <div className="text-[11px] text-muted" dangerouslySetInnerHTML={{ __html: meta }} />
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Coluna esquerda: CPU + GPU + Armazenamento */}
      <div className="flex flex-col gap-4">
        <SectionCard title={t('processor')}>
          <PCard
            name="AMD Ryzen 7 5800X"
            value="42"
            unit="%"
            meta='<b>4.2 GHz</b> · 8 núcleos · <b>58°C</b> · <b>65W</b>'
            spark={[30, 35, 42, 38, 45, 50, 48, 55, 42, 40]}
            color="var(--accent)"
          />
        </SectionCard>
        <SectionCard title={t('gpu')}>
          <PCard
            name="AMD Radeon RX 6600"
            value="78"
            unit="%"
            meta='<b>2.1 GHz</b> · <b>6.2 / 8 GB</b> VRAM · <b>95W</b>'
            spark={[60, 70, 75, 78, 82, 79, 76, 80, 78, 74]}
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
      <SectionCard title={t('activeWindow')}>
        <div className="flex flex-col items-center py-4 gap-3">
          <span className="text-[11px] px-3 py-1 rounded-full bg-panel-3 border border-border text-muted">
            {t('activeWindow')}
          </span>
          <div className="text-[11px] font-bold uppercase tracking-widest text-muted">{t('fps')}</div>
          <div className="text-7xl font-extrabold text-green leading-none">144</div>
          <div className="text-sm text-muted">Cyberpunk 2077</div>
          <div className="w-full mt-2">
            <div className="text-[10px] text-muted mb-1">{t('realTimeFps')}</div>
            <Spark points={[89, 120, 110, 135, 128, 150, 142, 138, 158, 144]} color="var(--green)" w={120} />
            <div className="flex justify-between text-[9px] text-muted mt-1">
              <span>-60s</span>
              <span>{t('agora')}</span>
            </div>
          </div>
          <div className="w-full grid grid-cols-3 gap-2 mt-3">
            {[
              [t('minLabel'), '89'],
              [t('avgLabel'), '132'],
              [t('maxLabel'), '158'],
            ].map(([l, v]) => (
              <div key={String(l)} className="text-center bg-panel-3 border border-border rounded-xl py-2">
                <div className="text-[10px] text-muted">{l}</div>
                <div className="text-lg font-bold">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Coluna direita: RAM + Rede + Energia */}
      <div className="flex flex-col gap-4">
        <SectionCard title={t('memory')}>
          <PCard
            name="RAM DDR4-3600"
            value="61"
            unit="%"
            meta='<b>9.8 GB</b> de <b>16 GB</b> · <b>3600 MHz</b>'
            spark={[55, 58, 62, 60, 64, 61, 59, 63, 61, 60]}
            color="var(--green)"
          />
        </SectionCard>
        <SectionCard title={t('network')}>
          <PCard
            name="Ethernet / Wi-Fi"
            value="2.4"
            unit="Mb/s ↓"
            meta='↑ <b>0.8 Mb/s</b> · IP local'
            spark={[2.0, 2.6, 2.2, 2.8, 2.4, 2.1, 2.5, 2.3, 2.6, 2.4]}
            color="var(--cyan)"
          />
        </SectionCard>
        <SectionCard title={t('power')}>
          <div className="flex flex-col gap-2">
            <div className="flex items-end gap-1">
              <span className="text-4xl font-extrabold text-accent leading-none">185</span>
              <span className="text-xs font-bold text-muted mb-1">W</span>
            </div>
            <div className="h-2 rounded-full bg-panel-3 overflow-hidden">
              <div className="h-full bg-accent" style={{ width: '45%' }} />
            </div>
            <div className="text-[11px] text-muted" dangerouslySetInnerHTML={{ __html: `${t('pcUptime')} <b>6h 22m</b> · ${t('session')} <b>02:14:37</b>` }} />
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
