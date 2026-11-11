import { SectionCard } from '../../layout'
import { useSettings } from '@/context/SettingsContext'
import { useAppDeckWS } from '@/ws'
import { useI18n } from '@/hooks/useI18n'

export function ConnectionSection({ settings, updateSettings, sendConfigGet, config, status }: {
  settings: import('@/context/SettingsContext').AppSettings
  updateSettings: import('@/context/SettingsContext').SettingsContextType['updateSettings']
  sendConfigGet: import('@/ws').sendConfigGet
  sendConfigSet: import('@/ws').sendConfigSet
  config: import('@/ws').Config | null
  status: import('@/ws').UseWSReturn['status'] | null
}) {
  const { t } = useI18n()

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
        <div className="flex items-center justify-between">
          <button
            onClick={() => sendConfigGet('agentIp')}
            className="text-sm bg-panel-3 border border-border rounded-lg px-2 py-1 text-text"
          >
            {t('testConnection')}
          </button>
          <span className={['status-badge', status === 'connected' ? 'on' : status === 'connecting' ? 'warning' : 'off', 'ml-2'].join(' ')}>{t('status')}: {status || t('disconnected')}</span>
        </div>
      </div>
    </SectionCard>
  )
}