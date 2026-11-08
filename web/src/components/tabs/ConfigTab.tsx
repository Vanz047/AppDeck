import { useState } from 'react'
import { SectionCard } from '../layout'
import { useSettings } from '../../context/SettingsContext'
import { useI18n } from '../../hooks/useI18n'

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

  const handleColorChange = (field: keyof typeof effectiveTheme, value: string) => {
    setCustom(true)
    updateCustomTheme({ [field]: value })
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
      {/* Pastas */}
      <SectionCard title={t().pastas}>
        <div className="flex flex-col gap-3">
          <div className="cfg-field">
            <label>{t().screenshots}</label>
            <input
              value={settings.screenshotDir}
              onChange={(e) => updateSettings('screenshotDir', e.target.value)}
              className="w-full bg-panel-3 border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent-2"
            />
          </div>
          <div className="cfg-field">
            <label>{t().clips}</label>
            <input
              value={settings.clipDir}
              onChange={(e) => updateSettings('clipDir', e.target.value)}
              className="w-full bg-panel-3 border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent-2"
            />
          </div>
        </div>
      </SectionCard>

      {/* Apps no Deck */}
      <SectionCard title={t().apps}>
        <div className="flex flex-col gap-3">
          {[
            { id: 'discord', name: t().discord },
            { id: 'stream', name: t().stream },
          ].map((app) => (
            <div
              key={app.id}
              className="flex items-center justify-between"
            >
              <span className="text-sm">{app.name}</span>
              <span
                className={[
                  'sw',
                  settings[app.id === 'discord' ? 'showDiscord' : 'showStream'] ? 'on' : '',
                ].join(' ')}
                onClick={() =>
                  updateSettings(
                    app.id === 'discord' ? 'showDiscord' : 'showStream',
                    !settings[app.id === 'discord' ? 'showDiscord' : 'showStream']
                  )
                }
                role="switch"
                aria-checked={
                  settings[app.id === 'discord' ? 'showDiscord' : 'showStream']
                }
              >
                <span className="sw-knob" />
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Conexão */}
      <SectionCard title={t().connection}>
        <div className="flex flex-col gap-3">
          <div className="cfg-field">
            <label>{t().agentIp}</label>
            <input
              value={settings.agentIp}
              onChange={(e) => updateSettings('agentIp', e.target.value)}
              placeholder="192.168.1.42:5555"
              className="w-full bg-panel-3 border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent-2"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{t().autoReconnect}</span>
            <span
              className={['sw', settings.autoReconnect ? 'on' : ''].join(' ')}
              onClick={() => updateSettings('autoReconnect', !settings.autoReconnect)}
              role="switch"
              aria-checked={settings.autoReconnect}
            >
              <span className="sw-knob" />
            </span>
          </div>
        </div>
      </SectionCard>

      {/* Cores do App */}
      <SectionCard title={t().colors}>
        <div className="flex flex-col gap-4">
          {/* Target tab selector */}
          <div>
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1.5">
              {t().targetTab}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {THEMABLE_TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTargetTab(t.id as 'global' | TabId)}
                  className={[
                    'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 text-xs font-semibold transition-all',
                    targetTab === t.id
                      ? 'border-accent-2 bg-panel-3 text-text'
                      : 'border-border text-muted hover:text-text',
                  ].join(' ')}
                >
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Presets */}
          <div>
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1.5">
              {t().preset}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className={[
                    'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 text-xs font-semibold transition-all',
                    settings.themePreset === p.id && !custom
                      ? 'border-accent-2 bg-panel-3 text-text'
                      : 'border-border text-muted hover:text-text',
                  ].join(' ')}
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 border-black/20"
                    style={{ background: p.accent }}
                  />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom color pickers */}
          <div>
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1.5">
              {t().customTheme}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { key: 'bg', labelKey: 'colorBg', hex: effectiveTheme.bg },
                  { key: 'panel3', labelKey: 'colorPanel', hex: effectiveTheme.panel3 },
                  { key: 'accent', labelKey: 'colorAccent', hex: effectiveTheme.accent },
                  { key: 'accent2', labelKey: 'colorAccent2', hex: effectiveTheme.accent2 },
                ] as const
              ).map((field) => (
                <div key={field.key} className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted font-mono">{t()[field.labelKey]}</span>
                  <div className="relative w-full">
                    <input
                      type="color"
                      value={field.hex}
                      onChange={(e) => handleColorChange(field.key as keyof typeof effectiveTheme, e.target.value)}
                      className="w-full h-9 rounded-lg border border-border cursor-pointer bg-panel-3 p-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {custom && (
            <button
              className="text-xs text-muted hover:text-text transition-colors self-start"
              onClick={resetColors}
            >
              {t().resetColors}
            </button>
          )}

          {/* Preview */}
          <div className="border-t border-border pt-3">
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1.5">
              {t().preview}
            </label>
            <div className="flex gap-2 flex-wrap">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                style={{ background: effectiveTheme.accent }}
              >
                Aa
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold"
                style={{
                  background: effectiveTheme.panel3,
                  color: effectiveTheme.text,
                  border: `1px solid ${effectiveTheme.border}`,
                }}
              >
                Bb
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold text-black"
                style={{ background: effectiveTheme.green }}
              >
                Cc
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${effectiveTheme.accent}, ${effectiveTheme.accent2})`,
                }}
              >
                Dd
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Idioma */}
      <SectionCard title={t().language}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <label className="text-sm w-32">{t().language}</label>
            <div className="flex gap-2">
              {(['pt-BR', 'en-US'] as const).map((l) => (
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
                  {l === 'pt-BR' ? '🇧🇷 Português' : '🇺🇸 English'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Botão Salvar */}
      <div className="lg:col-span-2 flex gap-3">
        <button
          className="stream-btn flex-1"
          onClick={showSaveToast}
          disabled={saveToast}
        >
          {saveToast ? t().saveSaved : t().saveConfigurations}
        </button>
        <button
          className="stream-btn"
          style={{ background: 'rgba(248,113,113,.15)', color: '#f87171', borderColor: 'rgba(248,113,113,.35)' }}
          onClick={() => { updateSettings('themePreset', 'default'); updateSettings('customTheme', null); setCustom(false); }}
        >
          Resetar tudo
        </button>
      </div>

      {saveToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-panel-2 border border-accent-2 rounded-xl px-5 py-3 text-center text-sm text-accent-2 shadow-lg">
            ✅ {t().saveSaved}
          </div>
        </div>
      )}
    </div>
  )
}