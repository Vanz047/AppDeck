import { useState } from 'react'

const PLATFORMS = [
  { id: 'twitch', name: 'Twitch', color: '#9146FF' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000' },
  { id: 'kick', name: 'Kick', color: '#5AFF5A' },
]

export function StreamTab() {
  const [platform, setPlatform] = useState('twitch')
  const [live, setLive] = useState(false)

  const currentPlatform = PLATFORMS.find((p) => p.id === platform)

  return (
    <div className="discord-panel">
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
    </div>
  )
}
