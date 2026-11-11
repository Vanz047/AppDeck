// web/test/ws.test.ts — Unit tests for AppDeckWS class

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AppDeckWS, createActionMessage, createConfigGetMessage, createConfigSetMessage } from '../src/ws'
import { validateMessage, type Metrics, type Ack, type Config, type Action } from 'shared'

// -----------------------------------------------------------------------------
// Mock WebSocket — fires onopen on next microtask
// -----------------------------------------------------------------------------

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
    // If already open, fire immediately (real WebSocket behavior)
    if (this.readyState === SyncMockWebSocket.OPEN && fn) {
      queueMicrotask(() => fn())
    }
  }

  constructor(public readonly url: string) {
    // Fire onopen on next microtask so tests can attach handlers first
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
  simulateError() {
    this.onerror?.(new Event('error'))
  }
}

let mockWsInstance: MockWebSocketInstance | null = null

beforeEach(() => {
  mockWsInstance = null
})

// Replace global WebSocket with sync mock for all tests
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

// Helper to wait for connect - onopen fires automatically via queueMicrotask
async function connectAndFire(ws: AppDeckWS): Promise<void> {
  await ws.connect()
}

// -----------------------------------------------------------------------------
// Test data helpers
// -----------------------------------------------------------------------------

function createValidMetrics(): Metrics {
  return {
    cpu: 25.5,
    ram: 60.2,
    ramUsedGB: 8.5,
    fps: 144,
    timestamp: new Date().toISOString(),
  }
}

function createValidAck(for_: string, ok = true, detail = 'OK'): Ack {
  return { for_, ok, detail }
}

function createValidConfig(): Config {
  return {
    screenshotDir: 'C:\\shots',
    clipDir: 'C:\\clips',
    enabledApps: ['discord'],
    games: [],
  }
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe('AppDeckWS', () => {
  let cleanup: (() => void) | null = null
  let ws: AppDeckWS

  beforeEach(() => {
    setupWebSocketMock()
    cleanup = window.WebSocket.mock ? undefined : undefined // no restore needed since we overwrite

    ws = new AppDeckWS({
      agentIp: '192.168.1.42:5555',
      autoReconnect: true,
    })
    mockWsInstance = null // Reset so each test starts clean
  })

  afterEach(() => {
    ws.destroy()
    if (cleanup) cleanup()
    mockWsInstance = null
  })

  it('connects to ws://<agentIp>:5555', async () => {
    await connectAndFire(ws)

    expect(mockWsInstance).not.toBeNull()
    expect(mockWsInstance!.url).toBe('ws://192.168.1.42:5555')
    expect(ws.readyState).toBe(SyncMockWebSocket.OPEN)
  })

  it('sends action message', async () => {
    await connectAndFire(ws)

    const action: Action = { name: 'key-down', args: { btn: 'BTN_1', holdMs: 0 } }
    ws.send({ type: 'action', payload: action })

    expect(mockWsInstance?.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'action', payload: action })
    )
  })

  it('sends config.get message', async () => {
    await connectAndFire(ws)

    ws.send({ type: 'config', payload: { scope: 'get', key: 'screenshotDir' } })

    expect(mockWsInstance?.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'config', payload: { scope: 'get', key: 'screenshotDir' } })
    )
  })

  it('sends config.set message', async () => {
    await connectAndFire(ws)

    ws.send({ type: 'config', payload: { scope: 'set', key: 'screenshotDir', value: 'C:\\new' } })

    expect(mockWsInstance?.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'config', payload: { scope: 'set', key: 'screenshotDir', value: 'C:\\new' } })
    )
  })

  it('receives metrics', async () => {
    const handler = vi.fn()
    ws.on('metrics', handler)

    await connectAndFire(ws)

    const metrics = createValidMetrics()
    const msg = { type: 'metrics', payload: metrics }
    mockWsInstance?.simulateMessage(JSON.stringify(msg))

    expect(handler).toHaveBeenCalledWith(metrics)
  })

  it('receives ack', async () => {
    const handler = vi.fn()
    ws.on('ack', handler)

    await connectAndFire(ws)

    const ack = createValidAck('action', true, 'Action executed')
    const msg = { type: 'ack', payload: ack }
    mockWsInstance?.simulateMessage(JSON.stringify(msg))

    expect(handler).toHaveBeenCalledWith(ack)
  })

  it('receives error', async () => {
    const handler = vi.fn()
    ws.on('error', handler)

    await connectAndFire(ws)

    const error = createValidAck('action', false, 'Failed')
    const msg = { type: 'error', payload: error }
    mockWsInstance?.simulateMessage(JSON.stringify(msg))

    expect(handler).toHaveBeenCalledWith(error)
  })

  it('receives config', async () => {
    const handler = vi.fn()
    ws.on('config', handler)

    await connectAndFire(ws)

    const config = createValidConfig()
    const msg = { type: 'config', payload: config }
    mockWsInstance?.simulateMessage(JSON.stringify(msg))

    expect(handler).toHaveBeenCalledWith(config)
  })

  it('drops invalid message', async () => {
    const handler = vi.fn()
    ws.on('metrics', handler)

    await connectAndFire(ws)

    // Invalid: missing required fields
    mockWsInstance?.simulateMessage(JSON.stringify({ type: 'metrics', payload: { cpu: 10 } }))

    expect(handler).not.toHaveBeenCalled()
  })

  it('queues sends while disconnected', async () => {
    // Don't connect — stay disconnected
    const action: Action = { name: 'key-down', args: { btn: 'BTN_1' } }
    ws.send({ type: 'action', payload: action })

    // Should not have sent (no WebSocket created yet)
    expect(mockWsInstance).toBeNull()

    // Now connect
    await connectAndFire(ws)

    // Queue should be flushed
    expect(mockWsInstance?.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'action', payload: action })
    )
  })

  it('reconnects after close when autoReconnect=true', async () => {
    const originalCreateMock = globalThis.WebSocket

    let callCount = 0
    class TrackingWebSocket extends SyncMockWebSocket {
      constructor(url: string) {
        super(url)
        callCount++
        mockWsInstance = this
      }
    }
    ;(globalThis as any).WebSocket = TrackingWebSocket

    // Clean up the singleton from prior tests
    ws.destroy()
    mockWsInstance = null

    // Create NEW instance after replacing mock
    const testWs = new AppDeckWS({
      agentIp: '192.168.1.42:5555',
      autoReconnect: true,
    })

    await testWs.connect()
    // First ws already exists
    expect(callCount).toBe(1)
    const firstWs = mockWsInstance!
    firstWs.simulateClose()

    // Wait for reconnect timeout (3000ms)
    await new Promise<void>((resolve) => setTimeout(resolve, 3100))

    // Should have created a new WebSocket instance
    expect(callCount).toBe(2)

    testWs.destroy()
    ;(globalThis as any).WebSocket = originalCreateMock
  })

  it('respects autoReconnect=false', async () => {
    const originalCreateMock = globalThis.WebSocket

    let callCount = 0
    class NoReconnectMock extends SyncMockWebSocket {
      constructor(url: string) {
        super(url)
        callCount++
        mockWsInstance = this
      }
    }
    ;(globalThis as any).WebSocket = NoReconnectMock

    // Clean up the singleton from prior tests
    ws.destroy()
    mockWsInstance = null

    // Create NEW instance after replacing mock
    const noReconnectWS = new AppDeckWS({
      agentIp: '192.168.1.42:5555',
      autoReconnect: false,
    })

    await noReconnectWS.connect()
    expect(callCount).toBe(1)
    const wsInstance = mockWsInstance!
    wsInstance.simulateClose()

    // Wait a tick for any reconnect logic
    await new Promise<void>((resolve) => setTimeout(resolve, 100))

    // Should not have attempted reconnect
    expect(callCount).toBe(1)
    noReconnectWS.destroy()
    ;(globalThis as any).WebSocket = originalCreateMock
  })

  it('reconnects on agentIp change', async () => {
    const originalCreateMock = globalThis.WebSocket

    let callCount = 0
    let lastUrl = ''
    class TrackingWebSocket extends SyncMockWebSocket {
      constructor(url: string) {
        super(url)
        callCount++
        lastUrl = url
        mockWsInstance = this
      }
    }
    ;(globalThis as any).WebSocket = TrackingWebSocket

    // Create NEW instance after replacing mock
    const ws2 = new AppDeckWS({
      agentIp: '192.168.1.42:5555',
      autoReconnect: true,
    })
    await ws2.connect()

    // Original WS created (1 call)
    expect(callCount).toBe(1)
    expect(lastUrl).toBe('ws://192.168.1.42:5555')

    // Simulate close then update options — triggers graceful disconnect + reconnect
    mockWsInstance!.simulateClose()
    ws2.updateOptions({ agentIp: '10.0.0.1:5555' })

    // Wait for reconnect
    await new Promise<void>((resolve) => setTimeout(resolve, 100))

    // New WebSocket should be created (2 calls)
    expect(callCount).toBe(2)
    expect(lastUrl).toBe('ws://10.0.0.1:5555')

    ws2.destroy()
    ;(globalThis as any).WebSocket = originalCreateMock
  })

  it('cleans up on disconnect()', async () => {
    await connectAndFire(ws)

    const action: Action = { name: 'key-down', args: { btn: 'BTN_1' } }
    ws.send({ type: 'action', payload: action })

    ws.disconnect()

    expect(mockWsInstance?.close).toHaveBeenCalledWith(1000, 'Client disconnect')
    // After disconnect, a new WS would be created on next connect
    // The second send queues instead of sends
    expect(mockWsInstance?.send).toHaveBeenCalledTimes(1) // only first send before disconnect
  })

  it('off() removes handler', async () => {
    const handler = vi.fn()
    const off = ws.on('metrics', handler)

    await connectAndFire(ws)

    off()

    const metrics = createValidMetrics()
    mockWsInstance?.simulateMessage(JSON.stringify({ type: 'metrics', payload: metrics }))

    expect(handler).not.toHaveBeenCalled()
  })

  it('on() returns unsubscribe function', async () => {
    const handler = vi.fn()
    const unsubscribe = ws.on('metrics', handler)

    await connectAndFire(ws)

    const metrics = createValidMetrics()
    mockWsInstance?.simulateMessage(JSON.stringify({ type: 'metrics', payload: metrics }))

    expect(handler).toHaveBeenCalledTimes(1)

    unsubscribe()
    mockWsInstance?.simulateMessage(JSON.stringify({ type: 'metrics', payload: metrics }))

    expect(handler).toHaveBeenCalledTimes(1) // no additional call
  })
})

// -----------------------------------------------------------------------------
// Outbound builder tests
// -----------------------------------------------------------------------------

describe('Outbound message builders', () => {
  it('createActionMessage builds correct message', () => {
    const action: Action = { name: 'key-down', args: { btn: 'BTN_1', holdMs: 50 } }
    const msg = createActionMessage(action.name, action.args)

    expect(msg).toEqual({ type: 'action', payload: action })
    expect(validateMessage(msg)).not.toBeNull()
  })

  it('createConfigGetMessage builds correct message', () => {
    const msg = createConfigGetMessage('screenshotDir')

    expect(msg).toEqual({ type: 'config', payload: { scope: 'get', key: 'screenshotDir' } })
    expect(validateMessage(msg)).not.toBeNull()
  })

  it('createConfigGetMessage without key builds correct message', () => {
    const msg = createConfigGetMessage()

    expect(msg).toEqual({ type: 'config', payload: { scope: 'get', key: undefined } })
    expect(validateMessage(msg)).not.toBeNull()
  })

  it('createConfigSetMessage builds correct message', () => {
    const msg = createConfigSetMessage('screenshotDir', 'C:\\new\\path')

    expect(msg).toEqual({ type: 'config', payload: { scope: 'set', key: 'screenshotDir', value: 'C:\\new\\path' } })
    expect(validateMessage(msg)).not.toBeNull()
  })
})
