import { useEffect, useState } from 'react'
import { SectionCard } from './layout'
import { useI18n } from '@/hooks/useI18n'
import { useAppDeckWS } from '@/ws'
import type { Config, ConfigKey } from '@/ws'

export interface ConfigPanelProps {
  /** Config keys shown as editable fields. Defaults to screenshotDir + clipDir. */
  keys?: ConfigKey[]
  /** Called after config.set succeeds (or on any save). */
  onSaved?: () => void
}

/**
 * Reads agent config from the WS on mount, renders an editable field for
 * `screenshotDir` (and optionally `clipDir`), and writes changes back via
 * `config.set` when the user saves.
 */
export function ConfigPanel({
  keys = ['screenshotDir', 'clipDir'],
  onSaved,
}: ConfigPanelProps) {
  const { t } = useI18n()
  const { config, sendConfigGet, sendConfigSet, status } = useAppDeckWS()

  // Local editing state: initialised from WS config, updated on save
  const [values, setValues] = useState<Partial<Record<ConfigKey, string>>>({})
  const [saving, setSaving] = useState(false)

  // Load config from the agent when the connection first reports `config`
  useEffect(() => {
    if (config) {
      setValues({
        ...(keys.includes('screenshotDir') ? { screenshotDir: config.screenshotDir } : {}),
        ...(keys.includes('clipDir') ? { clipDir: config.clipDir } : {}),
      })
    }
  }, [config])

  // On mount, request config so we can populate fields
  useEffect(() => {
    sendConfigGet()
  }, [sendConfigGet])

  const handleChange = (key: ConfigKey, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    setSaving(true)
    keys.forEach((key) => {
      const val = values[key]
      if (val !== undefined) {
        sendConfigSet(key, val)
      }
    })
    // Brief saving indicator
    setTimeout(() => {
      setSaving(false)
      onSaved?.()
    }, 600)
  }

  const isConnected = status === 'connected'

  return (
    <SectionCard title={t('config')}>
      <div className="flex flex-col gap-3">
        {keys.map((key) => (
          <div key={key} className="cfg-field">
            <label>{t(key === 'screenshotDir' ? 'screenshots' : 'clips')}</label>
            <input
              value={values[key] ?? ''}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder="C:\Users\...\AppData\Local\...\shots"
              disabled={!isConnected}
              className={[
                'w-full bg-panel-3 border border-border rounded-xl px-3 py-2 text-sm text-text',
                'focus:outline-none focus:border-accent-2',
                !isConnected ? 'opacity-50 cursor-not-allowed' : '',
              ].join(' ')}
            />
          </div>
        ))}
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={handleSave}
            disabled={!isConnected || saving}
            className={[
              'text-xs font-bold px-4 py-2 rounded-lg transition-all',
              isConnected && !saving
                ? 'bg-gradient-to-br from-accent to-accent-2 text-white shadow-[0_4px_16px_rgba(124,58,237,.4)]'
                : 'bg-panel-3 border border-border text-muted opacity-50',
            ].join(' ')}
          >
            {saving ? t('saving') : t('saveConfigs')}
          </button>
          {!isConnected && (
            <span className="text-[10px] text-muted">{t('connectFirst')}</span>
          )}
        </div>
      </div>
    </SectionCard>
  )
}
