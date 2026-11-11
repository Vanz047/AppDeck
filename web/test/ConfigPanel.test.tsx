// web/test/ConfigPanel.test.tsx — Unit tests for ConfigPanel
// Strategy: test behaviour via the real useAppDeckWS + a fake WebSocket global,
// the same approach as useAppDeckWS.test.tsx. No vi.mock needed.

import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SettingsProvider } from '@/context/SettingsContext'
import { ConfigPanel } from '@/components/ConfigPanel'
import { __resetWSInstanceForTesting } from '@/ws'

// ---------------------------------------------------------------------------
// Minimal mock WebSocket that supports in-test message injection
// ---------------------------------------------------------------------------
let mockWs: any

function setupFakeWebSocket() {
  const OriginalWebSocket = globalThis.WebSocket
  globalThis.WebSocket = class {
    static CONNECTING = 0
    static OPEN = 1
    static CLOSING = 2
    static CLOSED = 3
    readyState = 0
    onopen: (() => void) | null = null
    onclose: ((e: CloseEvent) => void) | null = null
    onerror: ((e: Event) => void) | null = null
    onmessage: ((e: MessageEvent) => void) | null = null
    send = vi.fn()
    close = vi.fn()

    constructor(_url: string) {
      mockWs = this
      // Fire onopen in next microtask
      queueMicrotask(() => {
        this.readyState = 1
        this.onopen?.()
      })
    }
  } as any
  return () => {
    globalThis.WebSocket = OriginalWebSocket
  }
}

function simulateConfig(config: unknown) {
  mockWs.onmessage?.({ data: JSON.stringify({ type: 'config', payload: config }) })
}

function renderPanel(props: { onSaved?: () => void } = {}) {
  return render(
    <SettingsProvider>
      <ConfigPanel {...props} />
    </SettingsProvider>,
  )
}

let teardown: (() => void) | null = null

beforeEach(() => {
  __resetWSInstanceForTesting()
  mockWs = null
  teardown = setupFakeWebSocket()
})

afterEach(() => {
  teardown?.()
  teardown = null
})

describe('ConfigPanel', () => {
  it('requests config.get on mount', async () => {
    renderPanel()
    // Wait for the WebSocket to open, then check the first sent message
    await waitFor(() => expect(mockWs.send).toHaveBeenCalledTimes(1), { timeout: 2000 })
    const firstMsg = JSON.parse(mockWs.send.mock.calls[0][0])
    expect(firstMsg).toEqual({ type: 'config', payload: { scope: 'get', key: undefined } })
  })

  it('populates the screenshotDir field from an incoming config payload', async () => {
    renderPanel()
    // Wait for the fake WS to open, then push a config message
    await waitFor(() => expect(mockWs.readyState).toBe(1), { timeout: 2000 })

    act(() => {
      simulateConfig({
        screenshotDir: 'C:\\shots',
        clipDir: 'C:\\clips',
        enabledApps: ['discord'],
        games: [],
      })
    })

    const input = await screen.findByDisplayValue('C:\\shots')
    expect(input).toBeInTheDocument()
  })

  it('sends config.set for each edited key on save', async () => {
    renderPanel()
    await waitFor(() => expect(mockWs.readyState).toBe(1), { timeout: 2000 })

    act(() => {
      simulateConfig({
        screenshotDir: 'C:\\old',
        clipDir: 'C:\\clips',
        enabledApps: [],
        games: [],
      })
    })

    const shotInput = await screen.findByDisplayValue('C:\\old')
    act(() => {
      fireEvent.change(shotInput, { target: { value: 'C:\\new' } })
    })

    // Clear send calls from the mount-time config.get
    mockWs.send.mockClear()
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }))

    // config.set for screenshotDir (edited value)
    expect(mockWs.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'config', payload: { scope: 'set', key: 'screenshotDir', value: 'C:\\new' } }),
    )
    // config.set for clipDir (unchanged value)
    expect(mockWs.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'config', payload: { scope: 'set', key: 'clipDir', value: 'C:\\clips' } }),
    )
  })

  it('disables the save button when disconnected', async () => {
    // Use a WS that stays in CLOSED state so status never becomes 'connected'
    teardown?.()
    teardown = null
    globalThis.WebSocket = class {
      static CONNECTING = 0
      static OPEN = 1
      static CLOSING = 2
      static CLOSED = 3
      readyState = 3
      onopen: (() => void) | null = null
      onclose: ((e: CloseEvent) => void) | null = null
      onerror: ((e: Event) => void) | null = null
      onmessage: ((e: MessageEvent) => void) | null = null
      send = vi.fn()
      close = vi.fn()
      constructor() {
        // Never fires onopen — simulates a persistent disconnected state
      }
    } as any
    renderPanel()
    // Wait a tick for effects to settle
    await act(async () => { await new Promise((r) => setTimeout(r, 10)) })
    const saveBtn = screen.getByRole('button', { name: /salvar|salvando|guardar/i })
    expect(saveBtn).toBeDisabled()
  })
})
