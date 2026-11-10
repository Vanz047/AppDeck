import { useState } from 'react'
import { SectionCard } from '../layout'
import { useI18n } from '@/hooks/useI18n'

const OUTPUTS = ['Headset HyperX', 'Caixa de som', 'Monitor HDMI']

const APP_TRACKS = [
  { id: 'game', name: 'Jogo', vol: 80 },
  { id: 'music', name: 'Música', vol: 45 },
  { id: 'discord', name: 'Discord', vol: 60 },
  { id: 'browser', name: 'Navegador', vol: 30 },
] as const

function VolTrack({ value }: { value: number }) {
  return (
    <div className="relative h-2 rounded-full bg-panel-3 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-accent to-accent-2 rounded-full"
        style={{ width: `${value}%` }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-accent shadow"
        style={{ left: `calc(${value}% - 6px)` }}
      />
    </div>
  )
}

export function AudioTab() {
  const { t } = useI18n()
  const [out, setOut] = useState(0)
  const [master, setMaster] = useState(80)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Saída geral + volume */}
      <SectionCard title={t('generalOutput')}>
        <div className="flex flex-col gap-3">
          <select
            value={out}
            onChange={(e) => setOut(Number(e.target.value))}
            className="bg-panel-3 border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-accent-2"
          >
            {OUTPUTS.map((o, i) => (
              <option key={o} value={i}>
                {o}
              </option>
            ))}
          </select>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">{t('volume')}</span>
            <span className="font-bold text-accent-2">{master}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={master}
            onChange={(e) => setMaster(Number(e.target.value))}
            className="w-full accent-accent"
          />
        </div>
      </SectionCard>

      {/* Presets */}
      <SectionCard title={t('presets')}>
        <div className="text-[11px] text-muted-2 mb-3">
          {t('tapLoad')} · {t('holdSave')}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((slot) => (
            <button
              key={slot}
              className="flex flex-col items-center gap-2 py-3 bg-panel-3 border border-border rounded-2xl hover:border-accent-2 transition-colors"
            >
              <span className="text-lg font-bold text-accent-2">{slot}</span>
              <span className="w-8 h-8 rounded-full border-2 border-border" />
              <span className="text-[10px] text-muted">{t('emptySlot')}</span>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Trilhas por app */}
      <SectionCard title={t('playingApps')} className="lg:col-span-2">
        <div className="flex flex-col gap-3">
          {APP_TRACKS.map((tr) => (
            <div key={tr.id} className="flex items-center gap-3">
              <div className="w-24 text-sm font-semibold text-text/90 truncate">{tr.name}</div>
              <div className="flex-1">
                <VolTrack value={tr.vol} />
              </div>
              <div className="w-10 text-right text-xs text-muted">{tr.vol}%</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
