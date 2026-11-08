import { useState, useCallback, ReactNode } from 'react'
import { useSettings } from '../context/SettingsContext'
import type { Language } from '../context/SettingsContext'

const TRANSLATIONS = {
  'pt-BR': {
    appTitle: 'AppDeck',
    settings: 'Configurações',
    pastas: 'Pastas',
    screenshots: 'Pasta de screenshots',
    clips: 'Pasta de clipes',
    apps: 'Apps no Deck',
    discord: 'Discord',
    stream: 'Stream',
    connection: 'Conexão',
    agentIp: 'IP do agente',
    autoReconnect: 'Reconectar automaticamente',
    colors: 'Cores do App',
    preset: 'Preset',
    customTheme: 'Ajustar cores (RGB)',
    resetColors: '↩ Resetar cores ao preset',
    preview: 'Preview',
    saveConfigurations: 'Salvar configurações',
    saveSaved: 'Configurações salvas!',
    language: 'Idioma',
    targetTab: 'Personalizar cores para',
    selectTab: 'Selecione a aba cujas cores serão personalizadas',
    hideDiscord: 'Ocultar Discord',
    hideStream: 'Ocultar Stream',
    globalAll: 'Todas as telas',
    colorBg: 'Fundo',
    colorPanel: 'Blocos',
    colorAccent: 'Botões',
    colorAccent2: 'Highlight',
  },
  'en-US': {
    appTitle: 'AppDeck',
    settings: 'Settings',
    pastas: 'Folders',
    screenshots: 'Screenshot folder',
    clips: 'Clip folder',
    apps: 'Apps on Deck',
    discord: 'Discord',
    stream: 'Stream',
    connection: 'Connection',
    agentIp: 'Agent IP',
    autoReconnect: 'Auto reconnect',
    colors: 'Colors',
    preset: 'Preset',
    customTheme: 'Adjust colors (RGB)',
    resetColors: '↩ Reset colors',
    preview: 'Preview',
    saveConfigurations: 'Save settings',
    saveSaved: 'Settings saved!',
    language: 'Language',
    targetTab: 'Customize colors for',
    selectTab: 'Select the tab whose colors will be personalized',
    hideDiscord: 'Hide Discord',
    hideStream: 'Hide Stream',
    globalAll: 'All screens',
    colorBg: 'Background',
    colorPanel: 'Blocks',
    colorAccent: 'Buttons',
    colorAccent2: 'Highlight',
  },
} as const

export function useI18n() {
  const { settings } = useSettings()
  const lang = settings.language as Language

  const t = useCallback(() => {
    return (key: string) => TRANSLATIONS[lang][key as keyof typeof TRANSLATIONS[typeof lang]] ?? key
  }, [lang])

  return { t, lang }
}
