import { useState } from 'react'

const PLATFORMS = [
  { id: 'twitch', name: 'Twitch', color: '#9146FF' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000' },
  { id: 'kick', name: 'Kick', color: '#5AFF5A' },
]

const CHAT_MESSAGES = [
  { user: 'Kaio', color: '#a78bfa', text: 'que jogada absurda kkkk' },
  { user: 'Rafa', color: '#34d399', text: 'GG, isso foi épico' },
  { user: 'Lucas', color: '#60a5fa', text: 'clipa isso por favor' },
  { user: 'Bruno', color: '#fbbf24', text: 'primeira vez aqui, virei fã' },
  { user: 'Ana', color: '#f87171', text: 'salve a live!' },
  { user: 'Pedro', color: '#60a5fa', text: 'tá bom demais mano' },
]

export function StreamTab() {
  const [platform, setPlatform] = useState('twitch')
  const [live, setLive] = useState(false)
  const [recording, setRecording] = useState(false)
  const [paused, setPaused] = useState(false)
  const [newMessage, setNewMessage] = useState('')

  const currentPlatform = PLATFORMS.find((p) => p.id === platform)

  const controls = [
    {
      id: 'live',
      label: 'Iniciar Live',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="10 8 16 12 10 16 10 8"/>
        </svg>
      ),
      active: live,
      variant: 'start',
      onClick: () => setLive(!live),
    },
    {
      id: 'stop',
      label: 'Parar Live',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="6" width="12" height="12" rx="2"/>
        </svg>
      ),
      active: live,
      variant: 'stop',
      onClick: () => setLive(false),
    },
    {
      id: 'record',
      label: 'Gravar',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>
        </svg>
      ),
      active: recording && !paused,
      variant: 'rec',
      onClick: () => setRecording(!recording),
    },
    {
      id: 'pause',
      label: 'Pausar',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
        </svg>
      ),
      active: paused,
      variant: 'pause',
      onClick: () => setPaused(!paused),
    },
    {
      id: 'clip',
      label: 'Clip 5min',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
          <line x1="20" y1="4" x2="8.12" y2="15.88"/>
          <line x1="14.47" y1="14.48" x2="20" y2="20"/>
          <line x1="8.12" y1="8.12" x2="12" y2="12"/>
        </svg>
      ),
      active: false,
      variant: 'default',
      onClick: () => {},
    },
    {
      id: 'screenshot',
      label: 'Print',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
          <circle cx="12" cy="13" r="3"/>
        </svg>
      ),
      active: false,
      variant: 'default',
      onClick: () => {},
    },
  ]

  return (
    <div className="stream-panel">
      {/* Row 1: Header — name/platform, time, live status, controls */}
      <div className="stream-header">
        {/* 1. Jogo/Plataforma */}
        <div className="stream-identity">
          <div className="stream-logo" style={{ background: `linear-gradient(135deg, ${currentPlatform?.color}, #fff)` }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="10 8 16 12 10 16 10 8"/>
            </svg>
          </div>
          <div>
            <div className="stream-title">{currentPlatform?.name} • Valorant</div>
            <div className="stream-subtitle">Competitivo • FAF</div>
          </div>
        </div>

        {/* 2. Tempo de live */}
        <div className="stream-time">
          <span className="stream-time-label">{live || recording ? 'Tempo' : 'Offline'}</span>
          <span className="stream-time-value">{live || recording ? '01:23:45' : '--:--:--'}</span>
        </div>

        {/* 3. Live on/off */}
        <div className="stream-live-indicator">
          <span className={`stream-live-dot ${live ? 'active' : ''}`}></span>
          <span className={`stream-live-text ${live ? 'active' : ''}`}>{live ? 'AO VIVO' : 'OFFLINE'}</span>
        </div>

        {/* 5-10. Controles */}
        <div className="stream-controls">
          {controls.map((ctrl) => (
            <button
              key={ctrl.id}
              className={`stream-ctrl stream-ctrl-${ctrl.variant}${ctrl.active ? ` active-${ctrl.variant}` : ''}`}
              onClick={ctrl.onClick}
              title={ctrl.label}
            >
              {ctrl.icon}
              <span>{ctrl.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: Chat (left) + Platform Select (right) */}
      <div className="stream-body">
        {/* 4. Chat */}
        <div className="stream-chat">
          <div className="stream-chat-header">
            <h4>Chat</h4>
            <span className="stream-chat-count">1.2K</span>
          </div>
          <div className="stream-chat-messages">
            {CHAT_MESSAGES.map((msg, i) => (
              <div key={i} className="stream-chat-msg">
                <span style={{ color: msg.color }}>{msg.user}</span>
                <span>{msg.text}</span>
              </div>
            ))}
          </div>
          <div className="stream-chat-input-row">
            <input
              className="stream-chat-input"
              placeholder="Escrever mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') setNewMessage('') }}
            />
          </div>
        </div>

        {/* 5. Seletor de plataforma */}
        <div className="stream-platform-col">
          <div className="stream-platform-label">Plataforma</div>
          <select
            className="stream-platform-select"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            {PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {recording && !paused && (
            <div className="stream-rec-indicator">
              <span className="stream-rec-dot"></span>
              REC
            </div>
          )}
          {paused && (
            <div className="stream-pause-indicator">
              PAUSADO
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
