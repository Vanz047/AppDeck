import type { ReactNode } from 'react'
import { useI18n } from '@/hooks/useI18n'

export type TabId = 'perf' | 'audio' | 'jogos' | 'discord' | 'stream' | 'config'

export const TABS: { id: TabId; labelKey: string }[] = [
  { id: 'perf', labelKey: 'perf' },
  { id: 'audio', labelKey: 'audio' },
  { id: 'jogos', labelKey: 'jogos' },
  { id: 'discord', labelKey: 'discord' },
  { id: 'stream', labelKey: 'stream' },
  { id: 'config', labelKey: 'config' },
]

export function TabsBar({
  active,
  onChange,
  tabs,
}: {
  active: TabId
  onChange: (id: TabId) => void
  tabs: { id: TabId; labelKey: string }[]
}) {
  const { t } = useI18n()
  const handleConfig = () => onChange('config')
  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }
  return (
    <div className="top-bar flex items-center gap-2.5 p-3 sm:p-4 bg-gradient-to-b from-[rgba(14,14,22,.85)] to-[rgba(10,10,18,.92)] backdrop-blur border-b border-[rgba(42,42,58,.4)] rounded-b-3xl shadow-[0_4px_24px_rgba(0,0,0,.35)]">
      <div className="tabs flex gap-1.5 flex-1 overflow-x-auto py-0.5 px-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={[
              'relative px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200',
              active === tab.id
                ? 'text-white'
                : 'text-muted hover:text-text',
            ].join(' ')}
          >
            {active === tab.id ? (
              <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-accent to-accent-2 shadow-[0_4px_16px_rgba(124,58,237,.4)]" />
            ) : null}
            {t(tab.labelKey)}
          </button>
        ))}
      </div>
      <div className="top-icons flex gap-1">
        <button
          className="icon-btn"
          title={t('settingsTitle')}
          onClick={handleConfig}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.72l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.93l-.21.36a2 2 0 0 0 .73 2.7l.15.1a2 2 0 0 1 1 1.72v.2a2 2 0 0 1-1 1.72l-.15.09a2 2 0 0 0-.73 2.7l.21.36a2 2 0 0 0 2.73.93l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.72v.18a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.72l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.93l.21-.36a2 2 0 0 0-.73-2.7l-.15-.1a2 2 0 0 1-1-1.72v-.2a2 2 0 0 1 1-1.72l.15-.09a2 2 0 0 0 .73-2.7l-.21-.36a2 2 0 0 0-2.73-.93l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.72V4a2 2 0 0 0-2-2Z"/><circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
        <button
          className="icon-btn"
          title={t('fullscreenBtn')}
          onClick={handleFullscreen}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
          </svg>
        </button>
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
