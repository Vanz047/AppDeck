import { useState } from 'react'
import { SectionCard } from '../layout'
import type { GameEntry } from 'shared'

// O `ws` chega na T4.2 — por enquanto, estado local e chamadas que ainda
// não ligam. O protocolo do `shared` já cobre `add-game` / `launch-exe` /
// `key-down` / `key-up` para `BTN_1..8`.
const GAMES: GameEntry[] = [
  { name: 'Cyberpunk 2077', exePath: 'C:\\Games\\CP2077\\bin64\\cyberpunk2077_x64.exe', platform: 'Manual' },
  { name: 'Elden Ring', exePath: 'C:\\Games\\EldenRing\\eldenring.exe', platform: 'Steam' },
  { name: 'Valorant', exePath: 'C:\\Riot Games\\VALORANT\\live\\ShooterGame\\binaries\\Win64\\ShooterGame_BE.exe', platform: 'Riot' },
  { name: 'Minecraft', exePath: 'C:\\Games\\Minecraft\\Minecraft.exe', platform: 'Java' },
]

const BTN_LABELS = ['F13', 'F14', 'F15', 'F16', 'F17', 'F18', 'F19', 'F20']
const BTN_IDS = ['BTN_1', 'BTN_2', 'BTN_3', 'BTN_4', 'BTN_5', 'BTN_6', 'BTN_7', 'BTN_8']

export function GamesTab() {
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const [heldBtn, setHeldBtn] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [newExe, setNewExe] = useState('')
  const [newName, setNewName] = useState('')

  const game = activeGame ? GAMES.find((g) => g.name === activeGame) : null

  const startKeyHold = (btnId: string) => {
    setHeldBtn(btnId)
    // T4.2: envia { type:'action', payload:{ name:'key-down', args:{ btn: btnId, holdMs: 0 } } }
  }
  const endKeyHold = (btnId: string) => {
    setHeldBtn((cur) => (cur === btnId ? null : cur))
    // T4.2: envia { type:'action', payload:{ name:'key-up', args:{ btn: btnId } } }
  }

  const confirmAddGame = () => {
    if (!newExe.trim()) return
    // T4.2: envia { type:'action', payload:{ name:'add-game', args:{ exePath:newExe, name:newName || undefined } } }
    setAddOpen(false)
    setNewExe('')
    setNewName('')
  }

  if (game) {
    return (
      <div className="flex flex-col gap-4">
        <SectionCard>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold">{game.name}</h3>
              <div className="text-xs text-muted mt-0.5">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1 align-middle" />
                Em execução · {game.platform}
              </div>
            </div>
            <button
              onClick={() => setActiveGame(null)}
              className="text-xs text-muted hover:text-text border border-border rounded-lg px-3 py-1.5"
            >
              Voltar
            </button>
          </div>
        </SectionCard>

        <SectionCard title="TECLA NOVA — F13–F20">
          <p className="text-[11px] text-muted mb-3">
            Toque e segure para injetar a tecla no PC. Use as configurações do
            jogo para mapear cada tecla a uma função.
          </p>
          <div className="grid grid-cols-4 gap-3">
            {BTN_IDS.map((id, i) => (
              <button
                key={id}
                onPointerDown={() => startKeyHold(id)}
                onPointerUp={() => endKeyHold(id)}
                onPointerLeave={() => heldBtn === id && endKeyHold(id)}
                className={[
                  'relative py-4 rounded-2xl text-sm font-extrabold border-2 transition-all select-none touch-manipulation',
                  heldBtn === id
                    ? 'border-cyan bg-cyan/10 text-cyan scale-[.985] shadow-[0_0_24px_rgba(34,211,238,.35)]'
                    : 'border-border-2 bg-panel-3 text-muted hover:text-text',
                ].join(' ')}
              >
                {BTN_LABELS[i]}
                <div className="text-[9px] font-mono mt-1 opacity-60">{id}</div>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold">Seus jogos</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveGame(GAMES[0]?.name ?? null)}
              className="text-[11px] font-semibold px-3 py-1.5 border border-border rounded-lg text-muted hover:text-text"
            >
              ▶ Simular jogo
            </button>
            <button
              onClick={() => setAddOpen(true)}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-br from-accent to-accent-2 text-white shadow-[0_4px_16px_rgba(124,58,237,.4)]"
            >
              + Adicionar
            </button>
          </div>
        </div>
        <div className="text-[11px] text-muted-2 mb-3">
          {GAMES.length} jogos detectados na sua máquina
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {GAMES.map((g) => (
            <button
              key={g.name}
              onClick={() => setActiveGame(g.name)}
              className="group relative overflow-hidden rounded-2xl border border-border bg-panel-3 p-4 flex flex-col gap-3 text-left hover:border-accent-2 transition-colors"
            >
              <div className="w-full h-24 rounded-xl bg-gradient-to-br from-[#1a1a25] to-[#0e0e16] flex items-center justify-center">
                <span className="text-4xl opacity-80">
                  {g.name.charAt(0)}
                </span>
              </div>
              <div className="text-sm font-semibold truncate">{g.name}</div>
              <div className="text-[10px] text-muted">{g.platform}</div>
            </button>
          ))}
        </div>
      </SectionCard>

      {addOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-panel border border-border-2 rounded-2xl p-5 w-full max-w-md">
            <h2 className="text-base font-bold mb-4">Adicionar jogo</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-semibold text-muted block mb-1.5">
                  Caminho do executável
                </label>
                <input
                  value={newExe}
                  onChange={(e) => setNewExe(e.target.value)}
                  placeholder="C:\Games\XxxGame\game.exe"
                  className="w-full bg-panel-3 border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent-2 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted block mb-1.5">
                  Nome no deck (opcional)
                </label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex.: Cyberpunk 2077"
                  className="w-full bg-panel-3 border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent-2"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setAddOpen(false)}
                  className="text-xs font-semibold px-3 py-2 border border-border rounded-lg text-muted hover:text-text"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmAddGame}
                  className="text-xs font-bold px-4 py-2 rounded-lg bg-gradient-to-br from-accent to-accent-2 text-white shadow-[0_4px_16px_rgba(124,58,237,.4)]"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
