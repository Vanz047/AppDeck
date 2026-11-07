import type { ReactNode } from 'react'

export type TabId = 'perf' | 'audio' | 'jogos' | 'discord' | 'stream'

export const TABS: { id: TabId; label: string }[] = [
  { id: 'perf', label: 'Desempenho' },
  { id: 'audio', label: 'Áudio' },
  { id: 'jogos', label: 'Jogos' },
  { id: 'discord', label: 'Discord' },
  { id: 'stream', label: 'Stream' },
]

export function TabsBar({
  active,
  onChange,
  tabs,
}: {
  active: TabId
  onChange: (id: TabId) => void
  tabs: { id: TabId; label: string }[]
}) {
  return (
    <div className="top-bar flex items-center gap-2.5 p-3 sm:p-4 bg-gradient-to-b from-[rgba(14,14,22,.85)] to-[rgba(10,10,18,.92)] backdrop-blur border-b border-[rgba(42,42,58,.4)] rounded-b-3xl shadow-[0_4px_24px_rgba(0,0,0,.35)]">
      <div className="tabs flex gap-1.5 flex-1 overflow-x-auto py-0.5 px-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={[
              'relative px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200',
              active === t.id
                ? 'text-white'
                : 'text-muted hover:text-text',
            ].join(' ')}
          >
            {active === t.id ? (
              <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-accent to-accent-2 shadow-[0_4px_16px_rgba(124,58,237,.4)]" />
            ) : null}
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// Primitiva reutilizável: card de métrica / seção do mockup.
export function SectionCard({
  title,
  children,
  className = '',
}: {
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={[
        'bg-panel-2 border border-border rounded-2xl p-4',
        className,
      ].join(' ')}
    >
      {title ? (
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted mb-3">
          {title}
        </h3>
      ) : null}
      {children}
    </div>
  )
}
