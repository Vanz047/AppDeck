import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type TabId = 'perf' | 'audio' | 'jogos' | 'discord' | 'stream' | 'config'

export type Language = 'pt-BR' | 'en-US'

export interface ThemePreset {
  id: string
  name: string
  bg: string
  panel: string
  panel2: string
  panel3: string
  border: string
  accent: string
  accent2: string
  text: string
  muted: string
  green: string
  red: string
  cyan: string
}

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
  // Cores
  themePreset: string
  customTheme: Partial<ThemePreset> | null
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
  themePreset: 'default',
  customTheme: null,
  language: 'pt-BR',
}

const SETTINGS_KEY = 'appdeck-settings'

const PRESETS: ThemePreset[] = [
  {
    id: 'default',
    name: 'Padrão (Roxo)',
    bg: '#07070c',
    panel: '#0e0e16',
    panel2: '#13131c',
    panel3: '#1a1a25',
    border: '#1f1f2e',
    accent: '#7c3aed',
    accent2: '#a78bfa',
    text: '#e8e8f0',
    muted: '#6a6a82',
    green: '#34d399',
    red: '#f87171',
    cyan: '#22d3ee',
  },
  {
    id: 'neon-green',
    name: 'Neon Verde',
    bg: '#020a05',
    panel: '#041410',
    panel2: '#061f15',
    panel3: '#0a2e1e',
    border: '#0f3a28',
    accent: '#34d399',
    accent2: '#6ee7b7',
    text: '#d1fae5',
    muted: '#4b5e56',
    green: '#34d399',
    red: '#f87171',
    cyan: '#22d3ee',
  },
  {
    id: 'neon-cyan',
    name: 'Neon Ciano',
    bg: '#020710',
    panel: '#040f1f',
    panel2: '#06152a',
    panel3: '#0a1e3a',
    border: '#0f2845',
    accent: '#22d3ee',
    accent2: '#67e8f9',
    text: '#e0f2fe',
    muted: '#4a5e72',
    green: '#34d399',
    red: '#f87171',
    cyan: '#22d3ee',
  },
  {
    id: 'warm',
    name: 'Quente (Laranja)',
    bg: '#0a0604',
    panel: '#151008',
    panel2: '#1c150b',
    panel3: '#281d10',
    border: '#3a2a18',
    accent: '#f59e0b',
    accent2: '#fbbf24',
    text: '#fef3c7',
    muted: '#7a6a50',
    green: '#34d399',
    red: '#f87171',
    cyan: '#22d3ee',
  },
  {
    id: 'pink',
    name: 'Rosa Neon',
    bg: '#0a0206',
    panel: '#170410',
    panel2: '#1f0718',
    panel3: '#2d0a28',
    border: '#42153a',
    accent: '#f472b6',
    accent2: '#f9a8d4',
    text: '#fce7f3',
    muted: '#724a60',
    green: '#34d399',
    red: '#f87171',
    cyan: '#22d3ee',
  },
]

type SettingsContextType = {
  settings: AppSettings
  presets: readonly ThemePreset[]
  activePreset: ThemePreset
  effectiveTheme: ThemePreset
  updateSettings: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  updateCustomTheme: (partial: Partial<ThemePreset>) => void
  clearCustomTheme: () => void
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
    const theme = getEffectiveTheme()
    const root = document.documentElement.style
    const vars: Record<string, string> = {
      '--bg': theme.bg,
      '--panel': theme.panel,
      '--panel-2': theme.panel2,
      '--panel-3': theme.panel3,
      '--border': theme.border,
      '--accent': theme.accent,
      '--accent-2': theme.accent2,
      '--text': theme.text,
      '--muted': theme.muted,
      '--green': theme.green,
      '--red': theme.red,
      '--cyan': theme.cyan,
    }
    Object.entries(vars).forEach(([k, v]) => root.setProperty(k, v))
    // Apply language
    document.documentElement.lang = settings.language
  }, [settings])

  const activePreset = PRESETS.find(p => p.id === settings.themePreset) ?? PRESETS[0]

  const getEffectiveTheme = (): ThemePreset => {
    if (settings.customTheme) {
      return { ...activePreset, ...settings.customTheme }
    }
    return activePreset
  }

  const updateSettings = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateCustomTheme = (partial: Partial<ThemePreset>) => {
    setSettings(prev => ({
      ...prev,
      customTheme: { ...(prev.customTheme ?? {}), ...partial },
    }))
  }

  const clearCustomTheme = () => {
    setSettings(prev => ({ ...prev, customTheme: null }))
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    localStorage.removeItem(SETTINGS_KEY)
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        presets: PRESETS,
        activePreset,
        effectiveTheme: getEffectiveTheme(),
        updateSettings,
        updateCustomTheme,
        clearCustomTheme,
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