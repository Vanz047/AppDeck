import { useState } from 'react'

const PLATFORMS = [
  { id: 'twitch', name: 'Twitch', color: '#9146FF' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000' },
  { id: 'kick', name: 'Kick', color: '#5AFF5A' },
]

const STREAM_STATS = {
  time: '01:23:45',
  viewers: '45.2K',
  chat: '1.2K',
  clips: 12,
}

export function StreamTab() {
  const [platform, setPlatform] = useState('twitch')
  const [live, setLive] = useState(false)
  const [clipping, setClipping] = useState(false)

  const currentPlatform = PLATFORMS.find((p) => p.id === platform)

  const streamControls = [
    {
      id: 'live',
      label: 'Go Live',
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
      label: 'Stop',
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
      id: 'clip',
      label: 'Clip',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
          <line x1="20" y1="4" x2="8.12" y2="15.88"/>
          <line x1="14.47" y1="14.48" x2="20" y2="20"/>
          <line x1="8.12" y1="8.12" x2="12" y2="12"/>
        </svg>
      ),
      active: clipping,
      onClick: () => setClipping(!clipping),
    },
  ]

  return (
    <div className="discord-panel">
      {/* Header Card */}
      <div className="discord-card">
        <div className="logo" style={{ background: `linear-gradient(135deg, ${currentPlatform?.color}, #fff)` }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="10 8 16 12 10 16 10 8"/>
          </svg>
        </div>
        <div className="info">
          <h3>Stream</h3>
          <p>{currentPlatform?.name} • {live ? 'Ao vivo' : 'Offline'}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${live ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`}></span>
          <span className={`text-xs font-bold ${live ? 'text-red-400' : 'text-gray-500'}`}>
            {live ? 'LIVE' : 'OFF'}
          </span>
        </div>
      </div>

      {/* Controls + Platform Selection */}
      <div className="discord-card voice-section">
        <div className="voice-controls-row">
          {streamControls.map((ctrl) => (
            <button
              key={ctrl.id}
              className={`vc-btn-small${ctrl.active ? ` active-${ctrl.variant}` : ''}`}
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
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            {PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            className="stream-btn"
            onClick={() => setLive(true)}
            disabled={live}
            style={{ opacity: live ? 0.5 : 1 }}
          >
            Iniciar
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="discord-card participants-card">
        <div className="participants-header">
          <h4>Estadísticas</h4>
          <span className="count-badge">{STREAM_STATS.clips}</span>
        </div>
        <div className="participants-grid stream-stats-grid">
          {[
            { label: 'Tempo', value: STREAM_STATS.time, color: '#a78bfa' },
            { label: 'Viewers', value: STREAM_STATS.viewers, color: '#34d399' },
            { label: 'Chat', value: STREAM_STATS.chat, color: '#60a5fa' },
            { label: 'Clips', value: String(STREAM_STATS.clips), color: '#fbbf24' },
          ].map((stat) => (
            <div key={stat.label} className="participant-compact">
              <div className="avatar stat-avatar" style={{ background: stat.color }}>
                {stat.label.charAt(0)}
              </div>
              <div className="participant-info">
                <div className="participant-name stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
