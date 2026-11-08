import { useState } from 'react'

const SERVERS = [
  { id: 'guerra', name: 'Time de Guerra', icon: '🎮' },
  { id: 'comunidade', name: 'Comunidade BR', icon: '🇧🇷' },
  { id: 'dev', name: 'Dev Talk', icon: '💻' },
  { id: 'meu', name: 'Meu Servidor', icon: '⚙️' },
]

const CHANNELS = {
  guerra: [
    { id: 'guilda', name: 'Voz da Guilda', type: 'voice' },
    { id: 'lfg', name: 'LFG · Valorant', type: 'voice' },
    { id: 'desafio', name: 'Desafio · 2v2', type: 'voice' },
    { id: 'affinity', name: 'Affinity (somente amigos)', type: 'voice' },
    { id: 'general', name: 'general', type: 'text' },
    { id: 'music', name: 'music', type: 'voice' },
    { id: 'afk', name: 'AFK', type: 'voice' },
  ],
  comunidade: [
    { id: 'geral', name: 'Geral', type: 'voice' },
    { id: 'jogos', name: 'Jogos', type: 'voice' },
    { id: 'offtopic', name: 'Off-topic', type: 'text' },
  ],
  dev: [
    { id: 'code', name: 'Code Review', type: 'voice' },
    { id: 'deploy', name: 'Deploy', type: 'voice' },
    { id: 'random', name: 'Random', type: 'text' },
  ],
  meu: [
    { id: 'lobby', name: 'Lobby', type: 'voice' },
    { id: 'privado', name: 'Privado', type: 'voice' },
  ],
}

const PARTICIPANTS = [
  { id: '1', name: 'Kaio', avatar: 'K', color: 'linear-gradient(135deg, var(--accent), var(--accent-2))', speaking: true, deafened: false, muted: false },
  { id: '2', name: 'Rafa', avatar: 'R', color: 'linear-gradient(135deg, var(--blue), #60a5fa)', speaking: false, deafened: false, muted: true },
  { id: '3', name: 'Lucas', avatar: 'L', color: 'linear-gradient(135deg, var(--green), #4ade80)', speaking: true, deafened: false, muted: false },
  { id: '4', name: 'Bruno', avatar: 'B', color: 'linear-gradient(135deg, #f59e0b, #fbbf24)', speaking: false, deafened: true, muted: false },
  { id: '5', name: 'Ana', avatar: 'A', color: 'linear-gradient(135deg, var(--red), #f87171)', speaking: false, deafened: false, muted: true },
]

export function DiscordTab() {
  const [selectedServer, setSelectedServer] = useState('guerra')
  const [selectedChannel, setSelectedChannel] = useState('guilda')
  const [deafened, setDeafened] = useState(false)
  const [muted, setMuted] = useState(false)
  const [screenSharing, setScreenSharing] = useState(false)
  const [webcamOn, setWebcamOn] = useState(false)

  const currentChannels = CHANNELS[selectedServer] || []

  const voiceControls = [
    { id: 'deafen', label: 'Som', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5Z"/><line x1="19" y1="5" x2="23" y2="9"/><line x1="23" y1="5" x2="19" y2="9"/></svg>
    ), active: deafened, onClick: () => setDeafened(!deafened) },
    { id: 'mute', label: 'Mic', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
    ), active: muted, onClick: () => setMuted(!muted) },
    { id: 'screen', label: 'Tela', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
    ), active: screenSharing, onClick: () => setScreenSharing(!screenSharing) },
    { id: 'webcam', label: 'Câm', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
    ), active: webcamOn, onClick: () => setWebcamOn(!webcamOn) },
    { id: 'leave', label: 'Sair', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5m0 0l-5-5"/></svg>
    ), variant: 'rec', onClick: () => {} },
  ]

  return (
    <div className="discord-panel">
      {/* Header Card */}
      <div className="discord-card">
        <div className="logo">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M19.3 5.3A17 17 0 0 0 15 4l-.2.4a13 13 0 0 1 3.6 1.5 12 12 0 0 0-13 0A13 13 0 0 1 9 4.4L8.8 4a17 17 0 0 0-4.3 1.3C2.2 9.1 1.5 12.9 1.8 16.6A17 17 0 0 0 7 19l1-1.6c-.6-.2-1.2-.5-1.7-.8l.4-.3a12 12 0 0 0 10.6 0l.4.3c-.5.3-1.1.6-1.7.8L16 19a17 17 0 0 0 5.2-2.4c.4-4.4-.7-8.2-1.9-11.3ZM8.5 14c-.9 0-1.6-.8-1.6-1.8s.7-1.8 1.6-1.8 1.6.8 1.6 1.8-.7 1.8-1.6 1.8Zm7 0c-.9 0-1.6-.8-1.6-1.8s.7-1.8 1.6-1.8 1.6.8 1.6 1.8-.7 1.8-1.6 1.8Z" />
          </svg>
        </div>
        <div className="info">
          <h3>Discord</h3>
          <p>{SERVERS.find(s => s.id === selectedServer)?.name} • {CHANNELS[selectedServer]?.find(c => c.id === selectedChannel)?.name}</p>
        </div>
        <button className="stream-btn">Abrir</button>
      </div>

      {/* Voice Controls + Channel Selection */}
      <div className="discord-card voice-section">
        <div className="voice-controls-row">
          {voiceControls.map((ctrl) => (
            <button
              key={ctrl.id}
              className={`vc-btn-small${ctrl.active ? ' active' : ''}${ctrl.variant === 'rec' ? ' rec' : ''}`}
              onClick={ctrl.onClick}
              title={ctrl.label}
            >
              {ctrl.icon}
            </button>
          ))}
        </div>
        <div className="channel-selector">
          <select
            className="mixer-out"
            value={selectedServer}
            onChange={(e) => { setSelectedServer(e.target.value); setSelectedChannel(CHANNELS[e.target.value][0]?.id || '') }}
          >
            {SERVERS.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            className="mixer-out"
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
          >
            {currentChannels
              .filter((c) => c.type === 'voice')
              .map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
          </select>
          <button className="stream-btn">Entrar</button>
        </div>
      </div>

      {/* Participants */}
      <div className="discord-card participants-card">
        <div className="participants-header">
          <h4>Na Chamada</h4>
          <span className="count-badge">{PARTICIPANTS.length}</span>
        </div>
        <div className="participants-grid">
          {PARTICIPANTS.map((p) => (
            <div key={p.id} className="participant-compact">
              <div className="avatar" style={{ background: p.color }}>
                {p.avatar}
              </div>
              <div className="participant-info">
                <div className="participant-name">{p.name}</div>
                <div className="participant-flags">
                  {p.speaking && <span className="flag speaking">Falando</span>}
                  {p.muted && <span className="flag muted">🔇</span>}
                  {p.deafened && <span className="flag deafened">🔕</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}