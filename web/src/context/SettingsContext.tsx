import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type TabId = 'perf' | 'audio' | 'jogos' | 'discord' | 'stream' | 'config'

export type Language = 'pt-BR' | 'en-US'

export interface AppSettings {
  // Pastas
  screenshotDir: string
  clipDir: string
  // Apps
  showDiscord: boolean
  showStream: boolean
  // Conexão
  agentIp: string
  autoReconnect: boolean
  // Tema
  darkMode: boolean
  // Idioma
  language: Language
}

const DEFAULT_SETTINGS: AppSettings = {
  screenshotDir: 'C:\\Users\\Admin\\AppData\\Local\\Temp\\claude\\shots',
  clipDir: 'C:\\Users\\Admin\\AppData\\Local\\Temp\\claude\\clips',
  showDiscord: true,
  showStream: true,
  agentIp: '192.168.1.42:5555',
  autoReconnect: true,
  darkMode: true,
  language: 'pt-BR',
}

const SETTINGS_KEY = 'appdeck-settings'

export type SettingsContextType = {
  settings: AppSettings
  updateSettings: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(SETTINGS_KEY)
        if (stored) {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
        }
      } catch {}
    }
    return DEFAULT_SETTINGS
  })

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', settings.darkMode ? 'dark' : 'light')
    document.documentElement.lang = settings.language
  }, [settings.darkMode, settings.language])

  const updateSettings = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    localStorage.removeItem(SETTINGS_KEY)
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}