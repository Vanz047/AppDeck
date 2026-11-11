import { useState } from 'react'
import { useI18n } from '@/hooks/useI18n'
import { useAppDeckWS } from '@/ws'

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
    { id: 'lfg-text', name: 'lfg-text', type: 'text' },
    { id: 'clips', name: 'clips', type: 'text' },
    { id: 'offtopic', name: 'off-topic', type: 'text' },
  ],
  comunidade: [
    { id: 'geral', name: 'Geral', type: 'voice' },
    { id: 'jogos', name: 'Jogos', type: 'voice' },
    { id: 'offtopic', name: 'off-topic', type: 'text' },
    { id: 'anuncios', name: 'anúncios', type: 'text' },
  ],
  dev: [
    { id: 'code', name: 'Code Review', type: 'voice' },
    { id: 'deploy', name: 'Deploy', type: 'voice' },
    { id: 'random', name: 'random', type: 'text' },
    { id: 'bugs', name: 'bugs', type: 'text' },
    { id: 'feat', name: 'feature-requests', type: 'text' },
  ],
  meu: [
    { id: 'lobby', name: 'Lobby', type: 'voice' },
    { id: 'privado', name: 'Privado', type: 'voice' },
    { id: 'geral', name: 'geral', type: 'text' },
  ],
}

const TEXT_MESSAGES: Record<string, { user: string; color: string; text: string; time: string }[]> = {
  general: [
    { user: 'Kaio', color: '#a78bfa', text: 'alguém jogando hoje?', time: '14:32' },
    { user: 'Rafa', color: '#34d399', text: 'estou, entra no LFG', time: '14:33' },
    { user: 'Lucas', color: '#60a5fa', text: 'bora 🔥', time: '14:35' },
    { user: 'Marina', color: '#f87171', text: 'que jogada absurda ontem no clip', time: '14:38' },
    { user: 'Bruno', color: '#fbbf24', text: 'kkkk', time: '14:39' },
  ],
  'lfg-text': [
    { user: 'Tiago', color: '#fbbf24', text: '2v2 faltando 2, rank plat+ ok?', time: '13:10' },
    { user: 'Zeca', color: '#a78bfa', text: 'top, entra', time: '13:11' },
    { user: 'Ana', color: '#f87171', text: 'deixem o lfg aberto pra comunidade tb', time: '13:15' },
  ],
  clips: [
    { user: 'Nina', color: '#f87171', text: 'clip do clutch 1v3 de ontem 🎬', time: '11:05' },
    { user: 'DJ_Fan', color: '#34d399', text: 'salva, esse foi épico', time: '11:07' },
  ],
  'off-topic': [
    { user: 'Paulo', color: '#60a5fa', text: 'qual a série atual que vocês estão vendo?', time: '09:22' },
    { user: 'Vitor', color: '#60a5fa', text: 'The Bear, mandou bem', time: '09:24' },
    { user: 'Léo', color: '#5AFF5A', text: 'Stranger Things, clássico', time: '09:25' },
  ],
  anuncios: [
    { user: 'Admin', color: '#fbbf24', text: '📢 Servidor completo de amanhã, 20h, torneio interno', time: '08:00' },
    { user: 'Admin', color: '#fbbf24', text: 'Inscrições até sexta, dropa aqui o time', time: '08:01' },
  ],
  random: [
    { user: 'dev1', color: '#34d399', text: 'deploy em produção, 5 min de downtime', time: '16:00' },
    { user: 'dev2', color: '#a78bfa', text: 'depois disso volto a revisar os PRs', time: '16:02' },
  ],
  bugs: [
    { user: 'dev1', color: '#34d399', text: 'CRASH na tela de stream quando clica em Gravar 2x rápido', time: '10:15' },
    { user: 'dev3', color: '#f87171', text: 'reproduzi, é race condition no hook', time: '10:18' },
  ],
  feat: [
    { user: 'dev2', color: '#a78bfa', text: 'pensando em adicionar notificação de viewer na stream tab', time: '12:00' },
  ],
  geral: [
    { user: 'Kaio', color: '#a78bfa', text: 'bom dia galera', time: '07:00' },
    { user: 'Rafa', color: '#34d399', text: 'bom dia! 👋', time: '07:01' },
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
  const { t } = useI18n()
  const { sendAction } = useAppDeckWS()
  const [selectedServer, setSelectedServer] = useState('guerra')
  const [selectedChannel, setSelectedChannel] = useState('guilda')
  const [selectedTextChannel, setSelectedTextChannel] = useState('general')
  const [deafened, setDeafened] = useState(false)
  const [muted, setMuted] = useState(false)
  const [screenSharing, setScreenSharing] = useState(false)
  const [webcamOn, setWebcamOn] = useState(false)

  const currentChannels = CHANNELS[selectedServer] || []
  const textChannels = currentChannels.filter((c) => c.type === 'text')
  const textMessages = TEXT_MESSAGES[selectedTextChannel] || []

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
          <h3>{t('discord')}</h3>
          <p>{SERVERS.find(s => s.id === selectedServer)?.name} • {CHANNELS[selectedServer]?.find(c => c.id === selectedChannel)?.name}</p>
        </div>
        <button className="stream-btn" onClick={() => sendAction({ name: 'open-app', args: { app: 'discord' } })}>{t('open')}</button>
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
          <button className="stream-btn">{t('enter')}</button>
        </div>
      </div>

      {/* Participants */}
      <div className="discord-card participants-card">
        <div className="participants-header">
          <h4>{t('onCall')}</h4>
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
                  {p.speaking && <span className="flag speaking">{t('speaking')}</span>}
                  {p.muted && <span className="flag muted">🔇</span>}
                  {p.deafened && <span className="flag deafened">🔕</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Canais de texto (lateral) + Chat selecionado */}
      <div className="discord-card text-chat-card">
        <div className="text-chat-layout">
          {/* Coluna de canais de texto clicáveis */}
          <div className="text-channel-list">
            <div className="text-channel-list-header">
              <span>{t('texts')}</span>
            </div>
            {textChannels.length === 0 ? (
              <div className="text-channel-empty">{t('noTextChannels')}</div>
            ) : (
              textChannels.map((ch) => (
                <button
                  key={ch.id}
                  className={`text-channel-item${selectedTextChannel === ch.id ? ' active' : ''}`}
                  onClick={() => setSelectedTextChannel(ch.id)}
                >
                  <span className="text-channel-hash">#</span>
                  <span>{ch.name}</span>
                </button>
              ))
            )}
          </div>

          {/* Chat do canal selecionado */}
          <div className="text-chat-panel">
            <div className="text-chat-header">
              <span className="text-channel-hash">#</span>
              <span>{textChannels.find(c => c.id === selectedTextChannel)?.name || t('selectChannel')}</span>
            </div>
            <div className="text-chat-messages">
              {textMessages.length === 0 ? (
                <div className="text-chat-empty">{t('noMessagesYet')}</div>
              ) : (
                textMessages.map((m, i) => (
                  <div key={i} className="text-chat-msg">
                    <div className="text-chat-msg-head">
                      <span className="text-chat-msg-user" style={{ color: m.color }}>{m.user}</span>
                      <span className="text-chat-msg-time">{m.time}</span>
                    </div>
                    <div className="text-chat-msg-text">{m.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}