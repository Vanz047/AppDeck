import { useState, useMemo } from 'react'
import {
  TABS,
  type TabId,
  TabsBar,
} from './components/layout'
import { PerfTab } from './components/tabs/PerfTab'
import { AudioTab } from './components/tabs/AudioTab'
import { GamesTab } from './components/tabs/GamesTab'
import { DiscordTab } from './components/tabs/DiscordTab'
import { StreamTab } from './components/tabs/StreamTab'
import { ConfigTab } from './components/tabs/ConfigTab'
import { SettingsProvider, useSettings } from './context/SettingsContext'

function AppInner() {
  const [tab, setTab] = useState<TabId>('perf')
  const { settings } = useSettings()

  // Show/hide tabs based on settings + filter by target tab for color customization
  const visibleTabs = useMemo(() => {
    const filtered = TABS.filter(t => {
      if (t.id === 'config') return true
      if (t.id === 'discord') return settings.showDiscord
      if (t.id === 'stream') return settings.showStream
      return true
    })
    return filtered
  }, [settings])

  // If current tab is hidden, switch to first visible
  const resolvedTab = useMemo(() => {
    if (visibleTabs.find(t => t.id === tab)) return tab
    return visibleTabs[0]?.id ?? 'perf'
  }, [tab, visibleTabs])

  return (
    <div className="min-h-screen bg-bg flex justify-center p-4 sm:p-6">
      <div className="frame w-full max-w-[960px] min-h-[600px] bg-panel border-2 border-black rounded-frame shadow-[0_0_0_2px_#2a2a3a,0_30px_60px_rgba(0,0,0,.5)] flex flex-col overflow-hidden">
        <TabsBar active={resolvedTab} onChange={setTab} tabs={visibleTabs} />
        <div className="content flex-1 overflow-y-auto p-4 sm:p-6">
          {resolvedTab === 'perf' && <PerfTab />}
          {resolvedTab === 'audio' && <AudioTab />}
          {resolvedTab === 'jogos' && <GamesTab />}
          {resolvedTab === 'discord' && <DiscordTab />}
          {resolvedTab === 'stream' && <StreamTab />}
          {resolvedTab === 'config' && <ConfigTab />}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <SettingsProvider>
      <AppInner />
    </SettingsProvider>
  )
}
