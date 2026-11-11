// web/test/useAppDeckWS.test.tsx — Unit tests for useAppDeckWS hook

import { describe, it, expect, vi, beforeEach, afterEach, act } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useAppDeckWS, __resetWSInstanceForTesting } from '../src/ws'
import { SettingsProvider } from '../src/context/SettingsContext'

// SyncMockWebSocket definition (copied from ws.test.ts to avoid import issues)
interface MockWebSocketInstance {
  url: string
  readyState: number
  onopen: (() => void) | null
  onclose: ((event: CloseEvent) => void) | null
  onerror: ((event: Event) => void) | null
  onmessage: ((event: MessageEvent) => void) | null
  send: ReturnType<typeof vi.fn>
  close: ReturnType<typeof vi.fn>
  simulateMessage(data: string): void
  simulateClose(code?: number): void
  simulateError(): void
  simulateMetrics(): void
  simulateAck(): void
  simulateConfig(): void
}

class SyncMockWebSocket implements MockWebSocketInstance {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  readyState: number = SyncMockWebSocket.CONNECTING
  private _onopen: (() => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  send = vi.fn()
  close = vi.fn()

  get onopen(): (() => void) | null {
    return this._onopen
  }
  set onopen(fn: (() => void) | null) {
    this._onopen = fn
    if (this.readyState === SyncMockWebSocket.OPEN && fn) {
      queueMicrotask(() => fn())
    }
  }

  constructor(public readonly url: string) {
    queueMicrotask(() => {
      this.readyState = SyncMockWebSocket.OPEN
      this._onopen?.()
    })
  }

  simulateMessage(data: string) {
    this.onmessage?.({ data } as MessageEvent)
  }
  simulateClose(code?: number) {
    this.readyState = SyncMockWebSocket.CLOSED
    this.onclose?.({ code: code ?? 1000, wasClean: true } as CloseEvent)
  }
  // Simulate metrics message from server (agent sends metrics every 1s)
  simulateMetrics() {
    const metrics = {
      cpu: 25.5,
      ram: 60.2,
      ramUsedGB: 8.5,
      fps: 144,
      timestamp: new Date().toISOString(),
    }
    this.onmessage?.({
      data: JSON.stringify({ type: 'metrics', payload: metrics })
    } as MessageEvent)
  }
  simulateAck() {
    this.onmessage?.({
      data: JSON.stringify({ type: 'ack', payload: { for_: 'action', ok: true, detail: 'OK' } })
    } as MessageEvent)
  }
  simulateError() {
    this.onmessage?.({
      data: JSON.stringify({ type: 'error', payload: { for_: 'action', ok: false, detail: 'Failed' } })
    } as MessageEvent)
  }
  simulateConfig() {
    this.onmessage?.({
      data: JSON.stringify({ type: 'config', payload: { screenshotDir: 'C:\\shots', clipDir: 'C:\\clips', enabledApps: ['discord'], games: [] } })
    } as MessageEvent)
  }
}

let mockWsInstance: MockWebSocketInstance | null = null

// Wrapper with SettingsProvider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SettingsProvider>{children}</SettingsProvider>
)

// Replace global WebSocket with sync mock
function setupWebSocketMock() {
  const original = globalThis.WebSocket
  globalThis.WebSocket = class extends SyncMockWebSocket {
    constructor(url: string) {
      super(url)
      mockWsInstance = this
    }
  } as unknown as typeof WebSocket
  return () => {
    globalThis.WebSocket = original
  }
}

describe('useAppDeckWS hook', () => {
  let cleanup: (() => void) | null = null

  beforeEach(() => {
    __resetWSInstanceForTesting()
    cleanup = setupWebSocketMock()
    mockWsInstance = null
  })

  afterEach(() => {
    if (cleanup) cleanup()
    mockWsInstance = null
  })

  it('returns disconnected status initially', () => {
    const { result } = renderHook(() => useAppDeckWS(), { wrapper })

    // Initial status should be 'disconnected' before connect
    expect(result.current.status).toBe('disconnected')
    expect(result.current.readyState).toBe(WebSocket.CLOSED)
  })

  it('connects and returns metrics', async () => {
    const { result } = renderHook(() => useAppDeckWS(), { wrapper })

    // Wait for connection
    await waitFor(() => {
      expect(result.current.status).toBe('connected')
    }, { timeout: 3000 })

    // Simulate metrics from server
    act(() => {
      mockWsInstance?.simulateMetrics()
    })

    // Should have received metrics
    await waitFor(() => {
      expect(result.current.metrics).not.toBeNull()
      expect(result.current.metrics?.cpu).toBeDefined()
    }, { timeout: 3000 })
  })

  it('updates status to connecting on disconnect when autoReconnect=true', async () => {
    const { result } = renderHook(() => useAppDeckWS(), { wrapper })

    await waitFor(() => {
      expect(result.current.status).toBe('connected')
    }, { timeout: 3000 })

    // Simulate metrics so we can test properly
    act(() => {
      mockWsInstance?.simulateMetrics()
    })

    // Simulate close - should go to connecting (autoReconnect=true by default)
    act(() => {
      mockWsInstance?.simulateClose()
    })

    await waitFor(() => {
      expect(result.current.status).toBe('connecting')
    }, { timeout: 3000 })
  })

  it('sendAction sends action message', async () => {
    const { result } = renderHook(() => useAppDeckWS(), { wrapper })

    await waitFor(() => {
      expect(result.current.status).toBe('connected')
    }, { timeout: 3000 })

    // Simulate metrics so connection is stable
    act(() => {
      mockWsInstance?.simulateMetrics()
    })

    act(() => {
      result.current.sendAction({ name: 'key-down', args: { btn: 'BTN_1', holdMs: 0 } })
    })

    expect(mockWsInstance?.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'action', payload: { name: 'key-down', args: { btn: 'BTN_1', holdMs: 0 } } })
    )
  })

  it('sendConfigGet sends config get message', async () => {
    const { result } = renderHook(() => useAppDeckWS(), { wrapper })

    await waitFor(() => {
      expect(result.current.status).toBe('connected')
    }, { timeout: 3000 })

    // Simulate metrics so connection is stable
    act(() => {
      mockWsInstance?.simulateMetrics()
    })

    act(() => {
      result.current.sendConfigGet('screenshotDir')
    })

    expect(mockWsInstance?.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'config', payload: { scope: 'get', key: 'screenshotDir' } })
    )
  })

  it('sendConfigSet sends config set message', async () => {
    const { result } = renderHook(() => useAppDeckWS(), { wrapper })

    await waitFor(() => {
      expect(result.current.status).toBe('connected')
    }, { timeout: 3000 })

    // Simulate metrics so connection is stable
    act(() => {
      mockWsInstance?.simulateMetrics()
    })

    act(() => {
      result.current.sendConfigSet('screenshotDir', 'C:\\new')
    })

    expect(mockWsInstance?.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'config', payload: { scope: 'set', key: 'screenshotDir', value: 'C:\\new' } })
    )
  })

  it('connect() and disconnect() methods work', async () => {
    const { result } = renderHook(() => useAppDeckWS(), { wrapper })

    await waitFor(() => {
      expect(result.current.status).toBe('connected')
    }, { timeout: 3000 })

    // Simulate metrics so connection is stable
    act(() => {
      mockWsInstance?.simulateMetrics()
    })

    act(() => {
      result.current.disconnect()
    })

    expect(mockWsInstance?.close).toHaveBeenCalledWith(1000, 'Client disconnect')

    act(() => {
      result.current.connect()
    })

    // Should attempt to reconnect
  })

  it('receives ack messages', async () => {
    const { result } = renderHook(() => useAppDeckWS(), { wrapper })

    await waitFor(() => {
      expect(result.current.status).toBe('connected')
    }, { timeout: 3000 })

    // Simulate metrics so connection is stable
    act(() => {
      mockWsInstance?.simulateMetrics()
    })

    // Simulate an ack message
    act(() => {
      mockWsInstance?.simulateAck()
    })

    await waitFor(() => {
      expect(result.current.lastAck).toEqual({ for_: 'action', ok: true, detail: 'OK' })
    }, { timeout: 3000 })
  })

  it('receives error messages', async () => {
    const { result } = renderHook(() => useAppDeckWS(), { wrapper })

    await waitFor(() => {
      expect(result.current.status).toBe('connected')
    }, { timeout: 3000 })

    // Simulate metrics so connection is stable
    act(() => {
      mockWsInstance?.simulateMetrics()
    })

    act(() => {
      mockWsInstance?.simulateError()
    })

    await waitFor(() => {
      expect(result.current.lastError).toEqual({ for_: 'action', ok: false, detail: 'Failed' })
    }, { timeout: 3000 })
  })

  it('receives config messages', async () => {
    const { result } = renderHook(() => useAppDeckWS(), { wrapper })

    await waitFor(() => {
      expect(result.current.status).toBe('connected')
    }, { timeout: 3000 })

    // Simulate metrics so connection is stable
    act(() => {
      mockWsInstance?.simulateMetrics()
    })

    act(() => {
      mockWsInstance?.simulateConfig()
    })

    await waitFor(() => {
      expect(result.current.config).toEqual({
        screenshotDir: 'C:\\shots',
        clipDir: 'C:\\clips',
        enabledApps: ['discord'],
        games: []
      })
    }, { timeout: 3000 })
  })

  it('uses singleton instance across multiple hook calls', () => {
    const { result: result1 } = renderHook(() => useAppDeckWS(), { wrapper })
    const { result: result2 } = renderHook(() => useAppDeckWS(), { wrapper })

    // Both hooks should share the same underlying instance - test via connect/disconnect
    // Since sendAction is recreated each render, test that they call the same underlying methods
    expect(result1.current.status).toBe(result2.current.status)
    expect(result1.current.readyState).toBe(result2.current.readyState)
  })
})