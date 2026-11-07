import { useState } from 'react'
import { SectionCard } from '../layout'

const SITES = ['Twitch', 'YouTube', 'Kick']

function Stat({ v, l }: { v: string; l: string }) {
  return (
    <div className="text-center py-2 bg-panel-3 border border-border rounded-xl">
      <div className="text-xl font-extrabold">{v}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted mt-1">{l}</div>
    </div>
  )
}

export function StreamTab() {
  const [site, setSite] = useState(0)
  const [live, setLive] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <SectionCard>
        <div className="flex flex-col items-center gap-4 py-2">
          {/* Status */}
          <div className="flex items-center gap-3">
            <span
              className={`w-3 h-3 rounded-full ${
                live ? 'bg-red-400 animate-pulse' : 'bg-muted-2'
              }`}
            />
            <span
              className={`text-sm font-bold tracking-wider ${
                live ? 'text-red-400' : 'text-muted'
              }`}
            >
              {live ? 'TRANSMITINDO' : 'AGUARDO DE LIVE'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full">
            <Stat v="12:34" l="Tempo" />
            <Stat v="45.2K" l="Viewers" />
            <Stat v="345" l="Chat" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Plataforma">
        <div className="grid grid-cols-3 gap-2">
          {SITES.map((s, i) => (
            <button
              key={s}
              onClick={() => setSite(i)}
              className={`px-3 py-3 rounded-xl text-sm font-bold border transition-colors ${
                site === i
                  ? 'bg-gradient-to-br from-accent to-accent-2 border-accent text-white shadow-[0_4px_16px_rgba(124,58,237,.4)]'
                  : 'bg-panel-3 border-border text-muted hover:text-text'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Controles">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setLive(false)}
            className={`px-3 py-3.5 rounded-xl text-sm font-bold border transition-colors ${
              live
                ? 'bg-red-500 border-red-500 text-white shadow-[0_4px_20px_rgba(248,113,113,.4)]'
                : 'bg-panel-3 border-border text-muted'
            }`}
          >
            ■ Parar
          </button>
          <button className="px-3 py-3.5 rounded-xl text-sm font-bold border bg-panel-3 border-border text-text hover:bg-panel-3/60 transition-colors">
            ✂ Clip
          </button>
          <button
            onClick={() => setLive(true)}
            className={`px-3 py-3.5 rounded-xl text-sm font-bold border transition-colors ${
              live
                ? 'bg-panel-3 border-border text-muted'
                : 'bg-green-500 border-green-500 text-white shadow-[0_4px_20px_rgba(52,211,153,.4)]'
            }`}
          >
            ▶ Iniciar
          </button>
        </div>
      </SectionCard>
    </div>
  )
}
