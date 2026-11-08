import { useState } from 'react'

const PLATFORMS = [
  { id: 'twitch', name: 'Twitch', color: '#9146FF' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000' },
  { id: 'kick', name: 'Kick', color: '#5AFF5A' },
]

const CHATS: Record<string, { user: string; color: string; text: string }[]> = {
  twitch: [
    { user: 'Kaio', color: '#a78bfa', text: 'que jogada absurda kkkk' },
    { user: 'Rafa', color: '#34d399', text: 'GG, isso foi épico' },
    { user: 'Lucas', color: '#60a5fa', text: 'clipa isso por favor' },
    { user: 'Bruno', color: '#fbbf24', text: 'primeira vez aqui, virei fã' },
  ],
  youtube: [
    { user: 'Marina', color: '#f87171', text: 'Salve a live! Primeira vez aqui' },
    { user: 'DJ_Fan', color: '#34d399', text: 'Jogando muito hoje 🔥' },
    { user: 'Paulo', color: '#60a5fa', text: 'Superchat: 50 reais, mandou bem' },
    { user: 'Tiago', color: '#fbbf24', text: 'Assinando o canal agora' },
  ],
  kick: [
    { user: 'Léo', color: '#5AFF5A', text: 'KkKKK essa jogada' },
    { user: 'Nina', color: '#f87171', text: 'Salva, mano' },
    { user: 'Zeca', color: '#a78bfa', text: 'Boa, tá pegando pesado' },
    { user: 'Vitor', color: '#60a5fa', text: 'Achei a live por recomendação' },
  ],
}

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

      {/* Row 2: Chats (3 maiores lado a lado) */}
      <div className="stream-body">
        <div className="stream-chats-grid">
          <div className="stream-chat">
            <div className="stream-chat-header">
              <h4>Twitch</h4>
              <span className="stream-chat-count">1.2K</span>
            </div>
            <div className="stream-chat-messages">
              {CHATS.twitch.map((msg, i) => (
                <div key={i} className="stream-chat-msg">
                  <span style={{ color: msg.color }}>{msg.user}</span>
                  <span>{msg.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="stream-chat">
            <div className="stream-chat-header">
              <h4>YouTube</h4>
              <span className="stream-chat-count">890</span>
            </div>
            <div className="stream-chat-messages">
              {CHATS.youtube.map((msg, i) => (
                <div key={i} className="stream-chat-msg">
                  <span style={{ color: msg.color }}>{msg.user}</span>
                  <span>{msg.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="stream-chat">
            <div className="stream-chat-header">
              <h4>Kick</h4>
              <span className="stream-chat-count">450</span>
            </div>
            <div className="stream-chat-messages">
              {CHATS.kick.map((msg, i) => (
                <div key={i} className="stream-chat-msg">
                  <span style={{ color: msg.color }}>{msg.user}</span>
                  <span>{msg.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Seletor de plataforma removido - os 3 chats ficam sempre visíveis */}
      </div>

      {/* Row 3: Botões de controle abaixo dos chats */}
      <div className="stream-controls-bottom">
        {controls.map((ctrl) => (
          <button
            key={ctrl.id}
            className={`stream-ctrl-bottom stream-ctrl-${ctrl.variant}${ctrl.active ? ` active-${ctrl.variant}` : ''}`}
            onClick={ctrl.onClick}
            title={ctrl.label}
          >
            {ctrl.icon}
            <span>{ctrl.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
