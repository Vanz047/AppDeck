import { SectionCard } from '../../layout'
import { useSettings } from '@/context/SettingsContext'
import { useI18n } from '@/hooks/useI18n'

export function ConnectionSection({ settings, updateSettings, t }: {
  settings: import('@/context/SettingsContext').AppSettings
  updateSettings: import('@/context/SettingsContext').SettingsContextType['updateSettings']
  t: (key: string) => string
}) {
  return (
    <SectionCard title={t('connection')}>
      <div className="flex flex-col gap-3">
        <div className="cfg-field">
          <label>{t('agentIp')}</label>
          <input
            value={settings.agentIp}
            onChange={(e) => updateSettings('agentIp', e.target.value)}
            placeholder="192.168.1.42:5555"
            className="w-full bg-panel-3 border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-accent-2"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">{t('autoReconnect')}</span>
          <span
            className={['sw', settings.autoReconnect ? 'on' : ''].join(' ')}
            onClick={() => updateSettings('autoReconnect', !settings.autoReconnect)}
            role="switch"
            aria-checked={settings.autoReconnect}
          >
            <span className="sw-knob" />
          </span>
        </div>
      </div>
    </SectionCard>
  )
}