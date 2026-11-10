import { useState } from 'react'
import { SectionCard } from '../../layout'
import type { Language, AppSettings, SettingsContextType } from '@/context/SettingsContext'
import { useI18n } from '@/hooks/useI18n'

const LANG_LABELS: Record<Language, string> = {
  'pt-BR': '🇧🇷 Português',
  'en-US': '🇺🇸 English',
  'es-ES': '🇪🇸 Español',
  'de-DE': '🇩🇪 Deutsch',
}
const LANGS: Language[] = ['pt-BR', 'en-US', 'es-ES', 'de-DE']

export function LanguageSection({ settings, updateSettings }: {
  settings: AppSettings
  updateSettings: SettingsContextType['updateSettings']
}) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)

  const select = (l: Language) => {
    updateSettings('language', l)
    setOpen(false)
  }

  return (
    <SectionCard title={t('language')}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <label className="text-sm w-32">{t('language')}</label>
          <div className="cfg-lang-wrap">
            <button
              type="button"
              className={`cfg-lang-trigger${open ? ' open' : ''}`}
              onClick={() => setOpen(o => !o)}
              aria-haspopup="listbox"
              aria-expanded={open}
            >
              <span>{LANG_LABELS[settings.language]}</span>
              <span className="caret">▾</span>
            </button>
            <div className={`cfg-lang-menu${open ? ' open' : ''}`} role="listbox">
              {LANGS.map((l) => (
                <button
                  key={l}
                  type="button"
                  role="option"
                  aria-selected={settings.language === l}
                  className={`cfg-lang-opt${settings.language === l ? ' selected' : ''}`}
                  onClick={() => select(l)}
                >
                  <span>{LANG_LABELS[l]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
