import { useState } from 'react'
import { SectionCard } from '../layout'
import { useI18n } from '@/hooks/useI18n'
import type { GameEntry } from 'shared'

type GameT = ReturnType<typeof useI18n>['t']

// O `ws` chega na T4.2 — por enquanto, estado local e chamadas que ainda
// não ligam. O protocolo do `shared` já cobre `add-game` / `launch-exe` /
// `key-down` / `key-up` para `BTN_1..8`.

interface GameButton {
  id: string
  kind: 'atalho' | 'tecla'
  name: string
  desc?: string
  combo?: string
  active?: boolean
}

interface GameWithExtras extends GameEntry {
  id: string
  metrics?: { fps: number; cpu: number; gpu: number; ram: number }
  buttons?: GameButton[]
}

const GAMES: GameWithExtras[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk 2077',
    exePath: 'C:\\Games\\CP2077\\bin64\\cyberpunk2077_x64.exe',
    platform: 'Manual',
    metrics: { fps: 96, cpu: 68, gpu: 82, ram: 14.2 },
    buttons: [
      { id: 'cp-recarga', kind: 'atalho', name: 'Recarga rápida', desc: 'Ctrl+R', active: true },
      { id: 'cp-look', kind: 'atalho', name: 'Mudar look', desc: 'Ctrl+L', active: true },
    ],
  },
  {
    id: 'elden-ring',
    name: 'Elden Ring',
    exePath: 'C:\\Games\\EldenRing\\eldenring.exe',
    platform: 'Steam',
    metrics: { fps: 60, cpu: 45, gpu: 58, ram: 8.1 },
    buttons: [
      { id: 'er-roll', kind: 'atalho', name: 'Desvi (roll)', desc: 'Shift', active: true },
    ],
  },
  {
    id: 'valorant',
    name: 'Valorant',
    exePath: 'C:\\Riot Games\\VALORANT\\live\\ShooterGame\\binaries\\Win64\\ShooterGame_BE.exe',
    platform: 'Riot',
    metrics: { fps: 240, cpu: 41, gpu: 57, ram: 6.8 },
    buttons: [
      { id: 'v-buy', kind: 'atalho', name: 'Comprar util', desc: 'Ctrl+Shift+B', active: true },
      { id: 'v-reload', kind: 'atalho', name: 'Recarregar', desc: 'Ctrl+R', active: true },
    ],
  },
  {
    id: 'minecraft',
    name: 'Minecraft',
    exePath: 'C:\\Games\\Minecraft\\Minecraft.exe',
    platform: 'Java',
    metrics: { fps: 60, cpu: 30, gpu: 25, ram: 4.0 },
    buttons: [],
  },
]

const BTN_LABELS = ['F13', 'F14', 'F15', 'F16', 'F17', 'F18', 'F19', 'F20']
const BTN_IDS = ['BTN_1', 'BTN_2', 'BTN_3', 'BTN_4', 'BTN_5', 'BTN_6', 'BTN_7', 'BTN_8']

// Tempo de jogo simulado (o `ws` vai alimentar depois).
const SIM_MINUTES = 42

function formatPlaytime(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = Math.floor(minutes % 60)
  const s = Math.floor((minutes * 60) % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function AtalhoButton({ btn, onEdit, onToggle, t }: { btn: { id: string; kind: 'atalho' | 'tecla'; name: string; desc?: string; active?: boolean }; onEdit: () => void; onToggle: () => void; t: GameT }) {
  return (
    <button
      className={`group text-left px-3 py-2.5 rounded-xl transition-all active:scale-[.98] ${
        btn.active === false
          ? 'bg-panel-3 border border-border opacity-50'
          : 'bg-panel-3 border border-border hover:border-accent-2'
      }`}
      title={btn.desc}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-semibold text-text/90 group-hover:text-white truncate">
          {btn.name}
        </div>
        <div className="flex items-center gap-1">
          {btn.desc ? (
            <div className="text-[9px] font-mono text-muted-2 truncate max-w-[80px]">{btn.desc}</div>
          ) : null}
          <button
            className="p-1 rounded hover:bg-white/5 text-muted hover:text-text transition-colors"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            aria-label={t('editBtn', { name: btn.name })}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            </svg>
          </button>
        </div>
      </div>
    </button>
  )
}

function TeclaButton({
  btn,
  i,
  held,
  onDown,
  onUp,
}: {
  btn: string
  i: number
  held: boolean
  onDown: (id: string) => void
  onUp: (id: string) => void
}) {
  return (
    <button
      onPointerDown={() => onDown(btn)}
      onPointerUp={() => onUp(btn)}
      onPointerLeave={() => held && onUp(btn)}
      className={[
        'relative py-4 rounded-2xl text-sm font-extrabold border-2 transition-all select-none touch-manipulation',
        held
          ? 'border-cyan bg-cyan/10 text-cyan scale-[.985] shadow-[0_0_24px_rgba(34,211,238,.35)]'
          : 'border-border-2 bg-panel-3 text-muted hover:text-text',
      ].join(' ')}
    >
      {BTN_LABELS[i]}
      <div className="text-[9px] font-mono mt-1 opacity-60">{btn}</div>
    </button>
  )
}

function ShortcutModal({
  isOpen,
  onClose,
  game,
  editingBtn,
  kind,
  setKind,
  name,
  setName,
  combo,
  setCombo,
  keyId,
  setKeyId,
  onSave,
}: {
  isOpen: boolean
  onClose: () => void
  game: GameWithExtras | undefined
  editingBtn: GameButton | null
  kind: 'atalho' | 'tecla'
  setKind: (k: 'atalho' | 'tecla') => void
  name: string
  setName: (n: string) => void
  combo: string
  setCombo: (c: string) => void
  keyId: string
  setKeyId: (k: string) => void
  onSave: () => void
}) {
  const { t } = useI18n()
  if (!isOpen || !game) return null

  const isEditing = !!editingBtn
  const title = isEditing
    ? t('editBtn', { name: game.name })
    : t('newBtn', { name: game.name })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-panel border border-border-2 rounded-2xl p-5 w-full max-w-md max-h-[85vh] overflow-y-auto">
        <h2 className="text-base font-bold mb-4 flex items-center justify-between">
          {title}
          <button className="text-muted hover:text-text text-xl leading-none" onClick={onClose}>×</button>
        </h2>

        {/* Tipo do botão (só aparece em edição) */}
        {isEditing && (
          <div className="sm-field sm-edit mb-4">
            <label className="text-[11px] font-semibold text-muted block mb-1.5">{t('shortcutType')}</label>
            <div className="flex gap-2" role="radiogroup">
              <button
                role="radio"
                aria-checked={kind === 'atalho'}
                onClick={() => setKind('atalho')}
                className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  kind === 'atalho'
                    ? 'bg-gradient-to-br from-accent to-accent-2 text-white shadow-[0_4px_16px_rgba(124,58,237,.4)]'
                    : 'bg-panel-3 border border-border text-muted hover:text-text'
                }`}
              >
                {t('shortcutOpt')}
              </button>
              <button
                role="radio"
                aria-checked={kind === 'tecla'}
                onClick={() => setKind('tecla')}
                className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  kind === 'tecla'
                    ? 'bg-gradient-to-br from-accent to-accent-2 text-white shadow-[0_4px_16px_rgba(124,58,237,.4)]'
                    : 'bg-panel-3 border border-border text-muted hover:text-text'
                }`}
              >
                {t('keyOpt')}
              </button>
            </div>
          </div>
        )}

        {/* Formulário Atalho */}
        {kind === 'atalho' && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted block mb-1.5">
                {t('funcName')}
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Recarga rápida"
                className="w-full bg-panel-3 border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent-2"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted block mb-1.5">
                {t('comboKeys')}
              </label>
              <div className="combo-capture rounded-xl border-2 bg-panel-3 cursor-pointer transition-all select-none"
                style={{ borderColor: combo ? '#a78bfa' : 'var(--border-2)' }}
              >
                <div className="flex items-center gap-2 p-3">
                  <span className="text-lg text-accent-2">⌘</span>
                  <span className={`flex-1 text-sm font-mono ${combo ? 'text-text' : 'text-muted'}`}>
                    {combo || t('clickPressCombo')}
                  </span>
                  {combo && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setCombo(''); }}
                      className="p-1 rounded hover:bg-white/10 text-muted hover:text-text transition-colors"
                      aria-label="Limpar combo"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
            <p className="text-[10px] text-muted">{t('comboNote')}</p>
          </div>
        )}

        {/* Formulário Tecla Nova */}
        {kind === 'tecla' && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted block mb-1.5">
                {t('physicalBtn')}
              </label>
              <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Escolha o botão físico">
                {BTN_IDS.map((id, i) => (
                  <button
                    key={id}
                    role="radio"
                    aria-checked={keyId === id}
                    onClick={() => setKeyId(id)}
                    className={`py-3 rounded-xl text-sm font-extrabold border-2 transition-all select-none ${
                      keyId === id
                        ? 'border-cyan bg-cyan/10 text-cyan shadow-[0_0_24px_rgba(34,211,238,.35)]'
                        : 'border-border-2 bg-panel-3 text-muted hover:text-text'
                    }`}
                  >
                    {BTN_LABELS[i]}
                    <div className="text-[9px] font-mono mt-1 opacity-60">{id}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted block mb-1.5">
                {t('funcNameOpt')}
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Segundo botão do mouse"
                className="w-full bg-panel-3 border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent-2"
              />
            </div>
            <p className="text-[10px] text-muted">{t('fKeyNote')}</p>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border-2">
          <button
            onClick={onClose}
            className="text-xs font-semibold px-4 py-2 border border-border rounded-lg text-muted hover:text-text"
          >
            {t('cancel')}
          </button>
          <button
            onClick={onSave}
            className="text-xs font-bold px-4 py-2 rounded-lg bg-gradient-to-br from-accent to-accent-2 text-white shadow-[0_4px_16px_rgba(124,58,237,.4)]"
          >
            {t('saveButton')}
          </button>
        </div>
      </div>
    </div>
  )
}

export function GamesTab() {
  const { t } = useI18n()
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const [heldBtn, setHeldBtn] = useState<string | null>(null)
  const [addGameOpen, setAddGameOpen] = useState(false)
  const [newExe, setNewExe] = useState('')
  const [newName, setNewName] = useState('')

  // Modal de atalho/tecla
  const [shortcutOpen, setShortcutOpen] = useState(false)
  const [editingBtn, setEditingBtn] = useState<GameButton | null>(null)
  const [shortcutKind, setShortcutKind] = useState<'atalho' | 'tecla'>('atalho')
  const [shortcutName, setShortcutName] = useState('')
  const [shortcutCombo, setShortcutCombo] = useState('')
  const [shortcutKeyId, setShortcutKeyId] = useState('')

  // Estado local de jogos — inicializa com o seed, mas nunca muta o const original
  const [games, setGames] = useState<GameWithExtras[]>(() => JSON.parse(JSON.stringify(GAMES)))

  const game = activeGame ? games.find((g) => g.name === activeGame) : undefined
  const m = game?.metrics ?? { fps: 0, cpu: 0, gpu: 0, ram: 0 }
  const gameButtons = game?.buttons ?? []

  // Filtra atalhos (não teclas novas) e divide em 2 grupos
  const atalhos = gameButtons.filter((b) => b.kind !== 'tecla')
  const half = Math.ceil(atalhos.length / 2)
  const groupLeft = atalhos.slice(0, half)
  const groupRight = atalhos.slice(half)

  // Teclas novas (BTN_1..8)
  const teclas = gameButtons.filter((b) => b.kind === 'tecla')
  const existingKeyIds = new Set(teclas.map((t) => t.id))

  const startKeyHold = (btnId: string) => {
    setHeldBtn(btnId)
    // T4.2: envia { type:'action', payload:{ name:'key-down', args:{ btn: btnId, holdMs: 0 } } }
  }
  const endKeyHold = (btnId: string) => {
    setHeldBtn((cur) => (cur === btnId ? null : cur))
    // T4.2: envia { type:'action', payload:{ name:'key-up', args:{ btn: btnId } } }
  }

  const openShortcutModal = (btn?: GameButton) => {
    if (btn) {
      setEditingBtn(btn)
      setShortcutKind(btn.kind)
      if (btn.kind === 'atalho') {
        setShortcutName(btn.name)
        setShortcutCombo(btn.combo || '')
        setShortcutKeyId('')
      } else {
        setShortcutName(btn.name)
        setShortcutCombo('')
        setShortcutKeyId(btn.id)
      }
    } else {
      setEditingBtn(null)
      setShortcutKind('atalho')
      setShortcutName('')
      setShortcutCombo('')
      setShortcutKeyId('')
    }
    setShortcutOpen(true)
  }

  const closeShortcutModal = () => {
    setShortcutOpen(false)
    setEditingBtn(null)
    setShortcutKind('atalho')
    setShortcutName('')
    setShortcutCombo('')
    setShortcutKeyId('')
  }

  const saveShortcut = () => {
    if (!game) return

    if (shortcutKind === 'atalho') {
      if (!shortcutName.trim()) { alert(t('shortcutNameReq')); return; }
      if (!shortcutCombo.trim()) { alert(t('pressComboReq')); return; }
    } else {
      if (!shortcutKeyId) { alert(t('pickBtnReq')); return; }
      if (editingBtn?.id !== shortcutKeyId && existingKeyIds.has(shortcutKeyId)) {
        alert(t('btnInUse')); return;
      }
    }

    setGames((prev) => {
      const pIndex = prev.findIndex((g) => g.name === game.name)
      if (pIndex === -1) return prev

      const updated = [...prev]
      const buttons = [...(updated[pIndex].buttons ?? [])]

      if (editingBtn) {
        // Edita existente
        const btnIndex = buttons.findIndex((b) => b.id === editingBtn.id)
        if (btnIndex !== -1) {
          if (shortcutKind === 'atalho') {
            buttons[btnIndex] = { ...buttons[btnIndex], kind: 'atalho', name: shortcutName, combo: shortcutCombo, desc: undefined }
          } else {
            buttons[btnIndex] = { id: shortcutKeyId, kind: 'tecla', name: shortcutName || shortcutKeyId }
          }
        }
      } else {
        // Cria novo
        if (shortcutKind === 'atalho') {
          buttons.push({
            id: game.id + '-atalho-' + (Date.now() % 100000),
            kind: 'atalho',
            name: shortcutName,
            combo: shortcutCombo,
            active: true,
          })
        } else {
          buttons.push({
            id: shortcutKeyId,
            kind: 'tecla',
            name: shortcutName || shortcutKeyId,
            active: true,
          })
        }
      }

      updated[pIndex] = { ...updated[pIndex], buttons }
      return updated
    })

    closeShortcutModal()
    // Força re-render do game view
    if (game) setActiveGame(game.name)
  }

  const toggleShortcutActive = (btnId: string) => {
    if (!game) return
    setGames((prev) => {
      const pIndex = prev.findIndex((g) => g.name === game.name)
      if (pIndex === -1) return prev
      const buttons = [...(prev[pIndex].buttons ?? [])]
      const btnIndex = buttons.findIndex((b) => b.id === btnId)
      if (btnIndex === -1) return prev
      buttons[btnIndex] = { ...buttons[btnIndex], active: !buttons[btnIndex].active }
      const updated = [...prev]
      updated[pIndex] = { ...updated[pIndex], buttons }
      return updated
    })
  }

  const deleteShortcut = (btnId: string) => {
    if (!game) return
    setGames((prev) => {
      const pIndex = prev.findIndex((g) => g.name === game.name)
      if (pIndex === -1) return prev
      const updated = [...prev]
      updated[pIndex] = {
        ...updated[pIndex],
        buttons: updated[pIndex].buttons?.filter((b) => b.id !== btnId),
      }
      return updated
    })
  }

  const confirmAddGame = () => {
    if (!newExe.trim()) return
    // T4.2: envia { type:'action', payload:{ name:'add-game', args:{ exePath:newExe, name:newName || undefined } } }
    setGames((prev) => [
      ...prev,
      {
        id: 'custom-' + Date.now(),
        name: newName || newExe.split(/[/\\]/).pop() || 'Jogo novo',
        exePath: newExe,
        platform: 'Manual',
        metrics: { fps: 0, cpu: 0, gpu: 0, ram: 0 },
        buttons: [],
      },
    ])
    setAddGameOpen(false)
    setNewExe('')
    setNewName('')
  }

  if (game) {
    // Stats com cores diferentes por métrica
    const statRows = [
      { label: 'CPU', value: String(m.cpu), color: '#a78bfa' },
      { label: 'GPU', value: String(m.gpu), color: '#3b82f6' },
      { label: 'RAM', value: `${m.ram.toFixed(1)} GB`, color: '#34d399' },
      { label: t('time'), value: formatPlaytime(SIM_MINUTES), color: undefined },
    ]
    return (
      <div className="flex flex-col gap-3">
        <ShortcutModal
          isOpen={shortcutOpen}
          onClose={closeShortcutModal}
          game={game}
          editingBtn={editingBtn}
          kind={shortcutKind}
          setKind={setShortcutKind}
          name={shortcutName}
          setName={setShortcutName}
          combo={shortcutCombo}
          setCombo={setShortcutCombo}
          keyId={shortcutKeyId}
          setKeyId={setShortcutKeyId}
          onSave={saveShortcut}
        />

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
          {/* ESQUERDA — Atalhos · A */}
          <div className="flex flex-col gap-2 min-w-[140px]">
            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-2">{t('shortcutsA')}</div>
            <div className="flex flex-col gap-2 flex-1">
              {groupLeft.map((b) => (
                <AtalhoButton
                  key={b.id}
                  btn={b}
                  onEdit={() => openShortcutModal(b)}
                  onToggle={() => toggleShortcutActive(b.id)}
                />
              ))}
              {groupLeft.length === 0 ? (
                <div className="text-[10px] text-muted-2 px-3 py-2">{t('emptySlot')}</div>
              ) : null}
              <button
                onClick={() => openShortcutModal()}
                className="rounded-2xl border border-dashed border-border-2 bg-panel-3 hover:border-accent-2 hover:bg-accent/10 transition-all cursor-pointer flex items-center gap-2 px-3 py-2.5 active:scale-[.98]"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-accent-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <span className="text-[11px] font-semibold text-text">{t('addShortcut')}</span>
              </button>
            </div>
          </div>

          {/* CENTRO — FPS hero + Teclas novas + bloco adição */}
          <div className="md:col-start-2 flex flex-col gap-3">
            {/* FPS Hero */}
            <div className="rounded-3xl bg-panel-3 border border-border p-5 flex flex-col items-center relative overflow-hidden shadow-[0_16px_56px_rgba(0,0,0,.5),0_0_24px_rgba(52,211,153,.08)]">
              {/* top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green to-transparent opacity-60" />
              <div className="text-base font-extrabold text-text mt-2">{game.name}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-green/70 mt-1">{t('fps')}</div>
              <div className="text-[64px] font-extrabold leading-none text-green tabular-nums" style={{ textShadow: '0 0 24px rgba(52,211,153,.4)' }}>
                {m.fps || '—'}
              </div>
              {/* sparkline mock */}
              <div className="w-full mt-5 pt-4 border-t border-border-2">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-green/60 mb-2">{t('realTimeFps')}</div>
                <svg viewBox="0 0 200 40" preserveAspectRatio="none" className="w-full h-10">
                  <polyline points="0,28 14,25 28,27 42,22 57,24 71,20 86,22 100,16 114,18 129,14 143,17 157,12 171,15 186,10 200,11"
                    fill="none" stroke="#34d399" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="0" y1="32" x2="200" y2="32" stroke="rgba(52,211,153,.2)" strokeWidth="1" opacity=".5" />
                </svg>
              </div>
              {/* stats row: CPU / GPU / RAM / Tempo */}
              <div className="grid grid-cols-4 gap-2 w-full mt-4">
                {statRows.map((s) => (
                  <div key={s.label} className="flex flex-col items-center gap-0.5">
                    <span className="text-[8px] font-semibold uppercase tracking-wide text-muted">{s.label}</span>
                    <span className="text-[14px] font-extrabold tabular-nums leading-none" style={{ color: s.color ?? 'inherit' }}>
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Teclas novas (BTN_1..8) */}
            <div className="rounded-2xl bg-panel-3 border border-border p-4">
              <div className="text-[9px] font-bold uppercase tracking-widest text-muted-2 mb-3">{t('newKeys')}</div>
              <div className="grid grid-cols-4 gap-2">
                {BTN_IDS.map((id, i) => {
                  const tecla = teclas.find((t) => t.id === id)
                  const isHeld = heldBtn === id
                  return (
                    <TeclaButton
                      key={id}
                      btn={id}
                      i={i}
                      held={isHeld}
                      onDown={startKeyHold}
                      onUp={endKeyHold}
                    />
                  )
                })}
              </div>
            </div>

            {/* Bloco de adição: Atalho / Tecla nova */}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => openShortcutModal()}
                className="rounded-2xl border border-dashed border-border-2 bg-panel-3 hover:border-accent-2 hover:bg-accent/10 transition-all cursor-pointer flex flex-col items-center gap-1 py-3.5 active:scale-[.98]">
                <span className="text-xl leading-none text-accent-2">⌘</span>
                <span className="text-[11px] font-bold text-text">Atalho</span>
                <small className="text-[9px] text-muted uppercase tracking-wider">combo de teclas</small>
              </button>
              <button onClick={() => { setShortcutKind('tecla'); openShortcutModal(); }}
                className="rounded-2xl border border-dashed border-border-2 bg-panel-3 hover:border-accent-2 hover:bg-accent/10 transition-all cursor-pointer flex flex-col items-center gap-1 py-3.5 active:scale-[.98]">
                <span className="text-xl leading-none text-accent-2">⌨</span>
                <span className="text-[11px] font-bold text-text">Tecla nova</span>
                <small className="text-[9px] text-muted uppercase tracking-wider">F13–F20</small>
              </button>
            </div>
          </div>

          {/* DIREITA — Atalhos · B */}
          <div className="flex flex-col gap-2 min-w-[140px]">
            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-2">{t('shortcutsB')}</div>
            <div className="flex flex-col gap-2 flex-1">
              {groupRight.map((b) => (
                <AtalhoButton
                  key={b.id}
                  btn={b}
                  onEdit={() => openShortcutModal(b)}
                  onToggle={() => toggleShortcutActive(b.id)}
                />
              ))}
              {groupRight.length === 0 ? (
                <div className="text-[10px] text-muted-2 px-3 py-2">{t('emptySlot')}</div>
              ) : null}
              <button
                onClick={() => openShortcutModal()}
                className="rounded-2xl border border-dashed border-border-2 bg-panel-3 hover:border-accent-2 hover:bg-accent/10 transition-all cursor-pointer flex items-center gap-2 px-3 py-2.5 active:scale-[.98]"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-accent-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <span className="text-[11px] font-semibold text-text">{t('addShortcut')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <ShortcutModal
        isOpen={shortcutOpen}
        onClose={closeShortcutModal}
        game={game}
        editingBtn={editingBtn}
        kind={shortcutKind}
        setKind={setShortcutKind}
        name={shortcutName}
        setName={setShortcutName}
        combo={shortcutCombo}
        setCombo={setShortcutCombo}
        keyId={shortcutKeyId}
        setKeyId={setShortcutKeyId}
        onSave={saveShortcut}
      />

      <SectionCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold">{t('yourGames')}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveGame(games[0]?.name ?? null)}
              className="text-[11px] font-semibold px-3 py-1.5 border border-border rounded-lg text-muted hover:text-text"
            >
              {t('simulateGame')}
            </button>
            <button
              onClick={() => setAddGameOpen(true)}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-br from-accent to-accent-2 text-white shadow-[0_4px_16px_rgba(124,58,237,.4)]"
            >
              {t('addGame')}
            </button>
          </div>
        </div>
        <div className="text-[11px] text-muted-2 mb-3">
          {t('detectedGames', { n: games.length })}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {games.map((g) => (
            <button
              key={g.name}
              onClick={() => setActiveGame(g.name)}
              className="group relative overflow-hidden rounded-2xl border border-border bg-panel-3 p-4 flex flex-col gap-3 text-left hover:border-accent-2 transition-colors"
            >
              <div className="w-full h-24 rounded-xl bg-gradient-to-br from-[#1a1a25] to-[#0e0e16] flex items-center justify-center">
                <span className="text-4xl opacity-80">{g.name.charAt(0)}</span>
              </div>
              <div className="text-sm font-semibold truncate">{g.name}</div>
              <div className="text-[10px] text-muted">{g.platform}</div>
            </button>
          ))}
        </div>
      </SectionCard>

      {addGameOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-panel border border-border-2 rounded-2xl p-5 w-full max-w-md">
            <h2 className="text-base font-bold mb-4">{t('addGameTitle')}</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-semibold text-muted block mb-1.5">
                  {t('exePath')}
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
                  {t('deckName')}
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
                  onClick={() => setAddGameOpen(false)}
                  className="text-xs font-semibold px-3 py-2 border border-border rounded-lg text-muted hover:text-text"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={confirmAddGame}
                  className="text-xs font-bold px-4 py-2 rounded-lg bg-gradient-to-br from-accent to-accent-2 text-white shadow-[0_4px_16px_rgba(124,58,237,.4)]"
                >
                  {t('addGame')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}