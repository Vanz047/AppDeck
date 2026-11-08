import { useState } from 'react'
import { SectionCard } from '../layout'

// Dados estáticos do mockup — virão do `shared` depois (T4.2).
const DEFAULTS = {
  screenshotDir: 'C:\\Users\\Admin\\AppData\\Local\\Temp\\claude\\shots',
  clipDir: 'C:\\Users\\Admin\\AppData\\Local\\Temp\\claude\\clips',
  agentIp: '192.168.1.42:5555',
  reconnect: true,
  apps: { discord: true, stream: true },
} as const

export function ConfigTab() {
  const [screenshotDir, setScreenshotDir] = useState(DEFAULTS.screenshotDir)
  const [clipDir, setClipDir] = useState(DEFAULTS.clipDir)
  const [agentIp, setAgentIp] = useState(DEFAULTS.agentIp)
  const [reconnect, setReconnect] = useState(DEFAULTS.reconnect)
  const [apps, setApps] = useState<Record<string, boolean>>({ ...DEFAULTS.apps })

  const save = () => alert('Configurações salvas')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
          <button className="stream-btn ml-auto" onClick={save}>Salvar pastas</button>
        </div>
      </SectionCard>

      <SectionCard title="Apps no Deck">
        <div className="flex flex-col gap-3">
          {[
            { id: 'discord', name: 'Discord' },
            { id: 'stream', name: 'Stream' },
          ].map((app) => (
            <div key={app.id} className="cfg-toggle flex items-center justify-between">
              <span>{app.name}</span>
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
                <span className="sw-knob"></span>
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Conexão">
        <div className="flex flex-col gap-3">
          <div className="cfg-field">
            <label>IP do agente</label>
            <input
              value={agentIp}
              onChange={(e) => setAgentIp(e.target.value)}
              className="w-full bg-panel-3 border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent-2"
            />
          </div>
          <div className="cfg-toggle flex items-center justify-between">
            <span>Reconectar automaticamente</span>
            <span
              className={[
                'sw',
                reconnect ? 'on' : '',
              ].join(' ')}
              onClick={() => setReconnect(!reconnect)}
              role="switch"
              aria-checked={reconnect}
            >
              <span className="sw-knob"></span>
            </span>
          </div>
          <button className="stream-btn ml-auto" onClick={save}>Salvar configurações</button>
        </div>
      </SectionCard>
    </div>
  )
}
