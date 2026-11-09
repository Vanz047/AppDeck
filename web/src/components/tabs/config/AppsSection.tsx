import { SectionCard } from '../../layout'
import { useSettings } from '@/context/SettingsContext'
import { useI18n } from '@/hooks/useI18n'

export function AppsSection({ settings, updateSettings, t }: {
  settings: import('@/context/SettingsContext').AppSettings
  updateSettings: import('@/context/SettingsContext').SettingsContextType['updateSettings']
  t: (key: string) => string
}) {
  return (
    <SectionCard title={t('apps')}>
      <div className="flex flex-col gap-3">
        {[
          { id: 'discord', key: 'showDiscord' as const, label: 'Discord' },
          { id: 'stream', key: 'showStream' as const, label: 'Stream' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm">{label}</span>
            <span
              className={['sw', settings[key] ? 'on' : ''].join(' ')}
              onClick={() => updateSettings(key, !settings[key])}
              role="switch"
              aria-checked={settings[key]}
            >
              <span className="sw-knob" />
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}