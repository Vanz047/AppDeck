import { SectionCard } from '../layout'

export function DiscordTab() {
  return (
    <div className="flex flex-col gap-3">
      {/* App Discord */}
      <SectionCard>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl bg-[#5865F2]/15 flex items-center justify-center shrink-0"
            style={{ color: '#5865F2' }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
              <path d="M19.3 5.3A17 17 0 0 0 15 4l-.2.4a13 13 0 0 1 3.6 1.5 12 12 0 0 0-13 0A13 13 0 0 1 9 4.4L8.8 4a17 17 0 0 0-4.3 1.3C2.2 9.1 1.5 12.9 1.8 16.6A17 17 0 0 0 7 19l1-1.6c-.6-.2-1.2-.5-1.7-.8l.4-.3a12 12 0 0 0 10.6 0l.4.3c-.5.3-1.1.6-1.7.8L16 19a17 17 0 0 0 5.2-2.4c.4-4.4-.7-8.2-1.9-11.3ZM8.5 14c-.9 0-1.6-.8-1.6-1.8s.7-1.8 1.6-1.8 1.6.8 1.6 1.8-.7 1.8-1.6 1.8Zm7 0c-.9 0-1.6-.8-1.6-1.8s.7-1.8 1.6-1.8 1.6.8 1.6 1.8-.7 1.8-1.6 1.8Z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold">Discord</h3>
            <p className="text-[11px] text-muted truncate">Conectado · Servidor "Time de Guerra"</p>
          </div>
          <button className="shrink-0 text-xs font-bold px-3 py-2 rounded-lg bg-panel-3 border border-border hover:border-accent-2 transition-colors">
            Abrir
          </button>
        </div>
      </SectionCard>

      {/* Voz */}
      <SectionCard>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#60a5fa)' }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M9 22h6" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold">Voz</h3>
            <p className="text-[11px] text-muted truncate">Em chamada com 2 pessoas</p>
          </div>
          <button className="shrink-0 text-xs font-bold px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/40 text-red-400 hover:bg-red-500/25 transition-colors">
            Sair
          </button>
        </div>
      </SectionCard>

      {/* Entrar em canal de voz */}
      <SectionCard>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent-2 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h3l2.5-4.5L13 18l2.5-4.5H21" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold mb-1.5">Entrar em canal de voz</h3>
            <select className="w-full bg-panel-3 border border-border rounded-lg px-2.5 py-1.5 text-xs text-text focus:outline-none focus:border-accent-2">
              <option>Voz da Guilda</option>
              <option>LFG · Valorant</option>
              <option>Desafio · 2v2</option>
              <option>Affinity (somente amigos)</option>
            </select>
          </div>
          <button className="shrink-0 text-xs font-bold px-3 py-2 rounded-lg bg-panel-3 border border-border hover:border-accent-2 transition-colors">
            Entrar
          </button>
        </div>
      </SectionCard>
    </div>
  )
}
