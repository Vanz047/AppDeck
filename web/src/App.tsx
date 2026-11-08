import { useState } from 'react'
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

export default function App() {
  const [tab, setTab] = useState<TabId>('perf')

  return (
    <div className="min-h-screen bg-bg flex justify-center p-4 sm:p-6">
      <div className="frame w-full max-w-[960px] min-h-[600px] bg-panel border-2 border-black rounded-frame shadow-[0_0_0_2px_#2a2a3a,0_30px_60px_rgba(0,0,0,.5)] flex flex-col overflow-hidden">
        <TabsBar active={tab} onChange={setTab} tabs={TABS} />
        <div className="content flex-1 overflow-y-auto p-4 sm:p-6">
          {tab === 'perf' && <PerfTab />}
          {tab === 'audio' && <AudioTab />}
          {tab === 'jogos' && <GamesTab />}
          {tab === 'discord' && <DiscordTab />}
          {tab === 'stream' && <StreamTab />}
          {tab === 'config' && <ConfigTab />}
        </div>
      </div>
    </div>
  )
}
