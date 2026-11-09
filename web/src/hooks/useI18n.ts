import { useCallback } from 'react'
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
    colors: 'Tema',
    darkMode: 'Modo Escuro',
    darkModeDesc: 'Alternar entre modo claro e escuro',
    saveConfigurations: 'Salvar configurações',
    saveSaved: 'Configurações salvas!',
    language: 'Idioma',
    hideDiscord: 'Ocultar Discord',
    hideStream: 'Ocultar Stream',
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
    colors: 'Theme',
    darkMode: 'Dark Mode',
    darkModeDesc: 'Switch between light and dark mode',
    saveConfigurations: 'Save settings',
    saveSaved: 'Settings saved!',
    language: 'Language',
    hideDiscord: 'Hide Discord',
    hideStream: 'Hide Stream',
  },
} as const

export function useI18n() {
  const { settings } = useSettings()
  const lang = settings.language as Language

  const t = useCallback((key: string) => {
    return TRANSLATIONS[lang][key as keyof typeof TRANSLATIONS[typeof lang]] ?? key
  }, [lang])

  return { t, lang }
}
