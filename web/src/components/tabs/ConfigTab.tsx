import { useState } from 'react'
import { SectionCard } from '../layout'
import { useSettings } from '@/context/SettingsContext'
import { useI18n } from '@/hooks/useI18n'
import { FoldersSection } from './config/FoldersSection'
import { AppsSection } from './config/AppsSection'
import { ConnectionSection } from './config/ConnectionSection'
import { ColorsSection } from './config/ColorsSection'
import { LanguageSection } from './config/LanguageSection'
import { SaveActions } from './config/SaveActions'

export function ConfigTab() {
  const { settings, updateSettings, resetSettings } = useSettings()
  const { t } = useI18n()

  const [saveToast, setSaveToast] = useState(false)

  const showSaveToast = () => {
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <FoldersSection settings={settings} updateSettings={updateSettings} t={t} />
      <AppsSection settings={settings} updateSettings={updateSettings} t={t} />
      <ConnectionSection settings={settings} updateSettings={updateSettings} t={t} />
      <ColorsSection />
      <LanguageSection settings={settings} updateSettings={updateSettings} t={t} />
      <SaveActions
        saveToast={saveToast}
        onSave={showSaveToast}
        onResetAll={() => { resetSettings(); showSaveToast() }}
        t={t}
      />
    </div>
  )
}
