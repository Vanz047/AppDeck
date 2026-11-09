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
import type { TabId } from '../layout'
import type { ThemePreset } from '@/context/SettingsContext'

// Abas que podem ter cores personalizadas
const THEMABLE_TABS = [
  { id: 'global', name: 'Todas as telas' },
  { id: 'perf', name: 'Desempenho' },
  { id: 'audio', name: 'Áudio' },
  { id: 'jogos', name: 'Jogos' },
  { id: 'discord', name: 'Discord' },
  { id: 'stream', name: 'Stream' },
  { id: 'config', name: 'Config' },
] as const

export function ConfigTab() {
  const {
    settings,
    presets,
    activePreset,
    effectiveTheme,
    updateSettings,
    updateCustomTheme,
    clearCustomTheme,
  } = useSettings()
  const { t, lang } = useI18n()

  const [custom, setCustom] = useState(false)
  const [targetTab, setTargetTab] = useState<'global' | TabId>('global')
  const [saveToast, setSaveToast] = useState(false)

  const applyPreset = (id: string) => {
    updateSettings('themePreset', id)
    updateSettings('customTheme', null)
    setCustom(false)
  }

  const handleColorChange = (field: keyof ThemePreset, value: string) => {
    setCustom(true)
    updateCustomTheme({ [field]: value })
  }

  const handleTargetTabChange = (tab: 'global' | TabId) => {
    setTargetTab(tab)
  }

  const resetColors = () => {
    updateSettings('customTheme', null)
    setCustom(false)
  }

  const showSaveToast = () => {
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <FoldersSection settings={settings} updateSettings={updateSettings} t={t} />
      <AppsSection settings={settings} updateSettings={updateSettings} t={t} />
      <ConnectionSection settings={settings} updateSettings={updateSettings} t={t} />
      <ColorsSection
        presets={presets}
        activePreset={activePreset}
        effectiveTheme={effectiveTheme}
        themePreset={settings.themePreset}
        custom={custom}
        targetTab={targetTab}
        onTargetTabChange={handleTargetTabChange}
        onApplyPreset={applyPreset}
        onColorChange={handleColorChange}
        onResetColors={resetColors}
        t={t}
      />
      <LanguageSection settings={settings} updateSettings={updateSettings} t={t} />
      <SaveActions
        saveToast={saveToast}
        onSave={showSaveToast}
        onResetAll={() => { updateSettings('themePreset', 'default'); updateSettings('customTheme', null); setCustom(false); }}
        t={t}
      />
    </div>
  )
}