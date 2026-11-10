import { SectionCard } from '../../layout'
import { useSettings } from '@/context/SettingsContext'
import { useI18n } from '@/hooks/useI18n'

export function ColorsSection() {
  const { settings, updateSettings } = useSettings()
  const { t } = useI18n()

  return (
    <SectionCard title={t('colors')} className="lg:col-span-2">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-semibold text-text">{t('darkMode')}</span>
          <span className="text-[11px] text-muted">{t('darkModeDesc')}</span>
        </div>
        <button
          role="switch"
          aria-checked={settings.darkMode}
          onClick={() => updateSettings('darkMode', !settings.darkMode)}
          className={[
            'sw',
            settings.darkMode ? 'on' : '',
          ].join(' ')}
        >
          <div className="sw-knob" />
        </button>
      </div>
    </SectionCard>
  )
}
