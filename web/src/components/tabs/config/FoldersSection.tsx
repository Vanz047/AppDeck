import { useSettings } from '@/context/SettingsContext'
import { useI18n } from '@/hooks/useI18n'
import { SectionCard } from '../../layout'

const THEMABLE_TABS = [
  { id: 'global', name: 'Todas as telas' },
  { id: 'perf', name: 'Desempenho' },
  { id: 'audio', name: 'Áudio' },
  { id: 'jogos', name: 'Jogos' },
  { id: 'discord', name: 'Discord' },
  { id: 'stream', name: 'Stream' },
  { id: 'config', name: 'Config' },
] as const

export function FoldersSection({ settings, updateSettings }: {
  settings: import('@/context/SettingsContext').AppSettings
  updateSettings: import('@/context/SettingsContext').SettingsContextType['updateSettings']
}) {
  const { t } = useI18n()

  return (
    <div className="lg:col-span-2">
      <SectionCard title={t('folders')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="cfg-field">
            <label>{t('screenshots')}</label>
            <input
              value={settings.screenshotDir}
              onChange={(e) => updateSettings('screenshotDir', e.target.value)}
              className="w-full bg-panel-3 border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-accent-2"
            />
          </div>
          <div className="cfg-field">
            <label>{t('clips')}</label>
            <input
              value={settings.clipDir}
              onChange={(e) => updateSettings('clipDir', e.target.value)}
              className="w-full bg-panel-3 border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-accent-2"
            />
          </div>
        </div>
      </SectionCard>
    </div>
  )
}