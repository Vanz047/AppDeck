import { useState, useEffect } from 'react'
import { SectionCard } from '../layout'

// ---------------------------------------------------------------------------
// Presets de tema (RGB / neon / pastel / dark)
// ---------------------------------------------------------------------------
type ThemePreset = {
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

const DEFAULT_PRESET = PRESETS[0]

// Aplica um preset (ou o customizado) ao document.documentElement
function applyTheme(p: ThemePreset) {
  const r = document.documentElement.style
  r.setProperty('--bg', p.bg)
  r.setProperty('--panel', p.panel)
  r.setProperty('--panel-2', p.panel2)
  r.setProperty('--panel-3', p.panel3)
  r.setProperty('--border', p.border)
  r.setProperty('--accent', p.accent)
  r.setProperty('--accent-2', p.accent2)
  r.setProperty('--text', p.text)
  r.setProperty('--muted', p.muted)
  r.setProperty('--green', p.green)
  r.setProperty('--red', p.red)
  r.setProperty('--cyan', p.cyan)
}

function clearTheme() {
  const r = document.documentElement.style
  ;[
    '--bg',
    '--panel',
    '--panel-2',
    '--panel-3',
    '--border',
    '--accent',
    '--accent-2',
    '--text',
    '--muted',
    '--green',
    '--red',
    '--cyan',
  ].forEach((v) => r.removeProperty(v))
}

export function ConfigTab() {
  // --- Pastas ---
  const [screenshotDir, setScreenshotDir] = useState(
    'C:\\Users\\Admin\\AppData\\Local\\Temp\\claude\\shots',
  )
  const [clipDir, setClipDir] = useState(
    'C:\\Users\\Admin\\AppData\\Local\\Temp\\claude\\clips',
  )

  // --- Apps ---
  const [apps, setApps] = useState<Record<string, boolean>>({
    discord: true,
    stream: true,
  })

  // --- Conexão ---
  const [agentIp, setAgentIp] = useState('192.168.1.42:5555')
  const [reconnect, setReconnect] = useState(true)

  // --- Cores ---
  const [preset, setPreset] = useState<string>(DEFAULT_PRESET.id)
  const [custom, setCustom] = useState(false)

  const applyPreset = (id: string) => {
    setPreset(id)
    setCustom(false)
    const p = PRESETS.find((x) => x.id === id)
    if (p) applyTheme(p)
  }

  const applyCustom = (field: keyof ThemePreset, value: string) => {
    setCustom(true)
    const base = PRESETS.find((x) => x.id === preset) ?? DEFAULT_PRESET
    applyTheme({ ...base, [field]: value })
  }

  const resetColors = () => {
    setCustom(false)
    clearTheme()
  }

  useEffect(() => {
    return () => clearTheme()
  }, [])

  const activePreset = PRESETS.find((x) => x.id === preset) ?? DEFAULT_PRESET

  const save = () => alert('Configurações salvas (mock — virá do WS T4.2)')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Pastas */}
      <SectionCard title="Pastas">
        <div className="flex flex-col gap-3">
          <div className="cfg-field">
            <label>Pasta de screenshots</label>
            <input
              value={screenshotDir}
              onChange={(e) => setScreenshotDir(e.target.value)}
              className="w-full bg-panel-3 border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent-2"
            />
          </div>
          <div className="cfg-field">
            <label>Pasta de clipes</label>
            <input
              value={clipDir}
              onChange={(e) => setClipDir(e.target.value)}
              className="w-full bg-panel-3 border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent-2"
            />
          </div>
        </div>
      </SectionCard>

      {/* Apps no Deck */}
      <SectionCard title="Apps no Deck">
        <div className="flex flex-col gap-3">
          {[
            { id: 'discord', name: 'Discord' },
            { id: 'stream', name: 'Stream' },
          ].map((app) => (
            <div
              key={app.id}
              className="flex items-center justify-between"
            >
              <span className="text-sm">{app.name}</span>
              <span
                className={[
                  'sw',
                  apps[app.id] ? 'on' : '',
                ].join(' ')}
                onClick={() =>
                  setApps((prev) => ({ ...prev, [app.id]: !prev[app.id] }))
                }
                role="switch"
                aria-checked={apps[app.id]}
              >
                <span className="sw-knob" />
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Conexão */}
      <SectionCard title="Conexão">
        <div className="flex flex-col gap-3">
          <div className="cfg-field">
            <label>IP do agente</label>
            <input
              value={agentIp}
              onChange={(e) => setAgentIp(e.target.value)}
              placeholder="192.168.1.42:5555"
              className="w-full bg-panel-3 border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent-2"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Reconectar automaticamente</span>
            <span
              className={[
                'sw',
                reconnect ? 'on' : '',
              ].join(' ')}
              onClick={() => setReconnect(!reconnect)}
              role="switch"
              aria-checked={reconnect}
            >
              <span className="sw-knob" />
            </span>
          </div>
        </div>
      </SectionCard>

      {/* Cores do App */}
      <SectionCard title="Cores do App">
        <div className="flex flex-col gap-3">
          {/* Presets */}
          <div>
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1.5">
              Preset
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className={[
                    'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 text-xs font-semibold transition-all',
                    preset === p.id && !custom
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

          {/* Custom cor pickers — editam o preset ativo */}
          <div>
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1.5">
              Ajustar cores (RGB)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { key: 'bg', label: 'Fundo', hex: activePreset.bg },
                  {
                    key: 'panel3',
                    label: 'Blocos',
                    hex: activePreset.panel3,
                  },
                  { key: 'accent', label: 'Botões', hex: activePreset.accent },
                  {
                    key: 'accent2',
                    label: 'Highlight',
                    hex: activePreset.accent2,
                  },
                ] as const
              ).map((field) => (
                <div key={field.key} className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted font-mono">
                    {field.label}
                  </span>
                  <div className="relative w-full">
                    <input
                      type="color"
                      value={field.hex}
                      onChange={(e) =>
                        applyCustom(field.key, e.target.value)
                      }
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
              ↩ Resetar cores ao preset
            </button>
          )}

          {/* Preview */}
          <div className="border-t border-border pt-3">
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1.5">
              Preview
            </label>
            <div className="flex gap-2 flex-wrap">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                style={{ background: activePreset.accent }}
              >
                Aa
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold"
                style={{
                  background: activePreset.panel3,
                  color: activePreset.text,
                  border: `1px solid ${activePreset.border}`,
                }}
              >
                Bb
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold text-black"
                style={{ background: activePreset.green }}
              >
                Cc
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${activePreset.accent}, ${activePreset.accent2})`,
                }}
              >
                Dd
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Botão salvar */}
      <div className="lg:col-span-2">
        <button className="stream-btn w-full" onClick={save}>
          Salvar configurações
        </button>
      </div>
    </div>
  )
}
