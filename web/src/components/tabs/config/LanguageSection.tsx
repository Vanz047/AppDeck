import { SectionCard } from '../../layout'
import { useSettings } from '@/context/SettingsContext'
import { useI18n } from '@/hooks/useI18n'

export function LanguageSection({ settings, updateSettings }: {
  settings: import('@/context/SettingsContext').AppSettings
  updateSettings: import('@/context/SettingsContext').SettingsContextType['updateSettings']
}) {
  const { t } = useI18n()

  return (
    <SectionCard title={t('language')}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <label className="text-sm w-32">{t('language')}</label>
          <div className="flex gap-2">
            {(['pt-BR', 'en-US', 'es-ES', 'de-DE'] as const).map((l) => (
              <button
                key={l}
                onClick={() => updateSettings('language', l)}
                className={[
                  'flex-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                  settings.language === l
                    ? 'bg-gradient-to-br from-accent to-accent-2 text-white shadow-[0_4px_16px_rgba(124,58,237,.4)]'
                    : 'bg-panel-3 border border-border text-muted hover:text-text',
                ].join(' ')}
              >
                {l === 'pt-BR' ? '🇧🇷 Português' : l === 'en-US' ? '🇺🇸 English' : l === 'es-ES' ? '🇪🇸 Español' : '🇩🇪 Deutsch'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  )
}