// web/src/ws.ts — WebSocket client for AppDeck (web ↔ agent)
// Two-layer API: AppDeckWS class (framework-agnostic) + useAppDeckWS hook (React)

import {
  validateMessage,
  type Message,
  type Metrics,
  type Action,
  type ActionName,
  type ActionArgs,
  type Config,
  type ConfigMessage,
  type ConfigKey,
  type Ack,
} from 'shared'

// ============================================
// Types
// ============================================

/** Options for the AppDeckWS class */
export interface WSOptions {
  agentIp: string              // e.g., '192.168.1.42:5555'
  autoReconnect: boolean       // from settings
  onMessage?: (msg: Message) => void
  onOpen?: () => void
  onClose?: (event: CloseEvent) => void
  onError?: (error: Event) => void
}

/** Outbound messages (web → agent) */
export type OutboundMessage =
  | { type: 'action'; payload: Action }
  | { type: 'config'; payload: ConfigMessage }

/** Inbound message type → payload mapping for typed event handlers */
export type InboundMessageType = 'metrics' | 'ack' | 'error' | 'config'
export type InboundPayloadMap = {
  metrics: Metrics
  ack: Ack
  error: Ack
  config: Config
}

/** Event map for type-safe on/off */
type EventMap = {
  metrics: [Metrics]
  ack: [Ack]
  error: [Ack]
  config: [Config]
}

/** Hook return type */
export interface UseWSReturn {
  // Connection state
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
  readyState: WebSocket['readyState']

  // Latest inbound data (reactive)
  metrics: Metrics | null
  lastAck: Ack | null
  lastError: Ack | null
  config: Config | null

  // Send helpers (typed)
  sendAction: (action: Action) => void
  sendConfigGet: (key?: ConfigKey) => void
  sendConfigSet: (key: ConfigKey, value: string) => void

  // Manual control (rarely needed)
  connect: () => void
  disconnect: () => void
}

// ============================================
// Outbound message builders (prevent invalid construction)
// ============================================

export function createActionMessage(name: ActionName, args: ActionArgs): { type: 'action'; payload: Action } {
  return { type: 'action', payload: { name, args } }
}

export function createConfigGetMessage(key?: ConfigKey): { type: 'config'; payload: ConfigMessage } {
  return { type: 'config', payload: { scope: 'get', key } }
}

export function createConfigSetMessage(key: ConfigKey, value: string): { type: 'config'; payload: ConfigMessage } {
  return { type: 'config', payload: { scope: 'set', key, value } }
}

// ============================================
// AppDeckWS class — framework-agnostic event emitter
// ============================================

export class AppDeckWS {
  private ws: WebSocket | null = null
  private options: WSOptions
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  private sendQueue: OutboundMessage[] = []
  private listeners: Map<InboundMessageType, Set<(payload: unknown) => void>> = new Map()
  private destroyed = false

  constructor(options: WSOptions) {
    this.options = options
    // Initialize listener sets
    ;(['metrics', 'ack', 'error', 'config'] as InboundMessageType[]).forEach((type) => {
      this.listeners.set(type, new Set())
    })
  }

  /** Current WebSocket readyState (delegates to internal ws or CLOSED) */
  get readyState(): WebSocket['readyState'] {
    return this.ws?.readyState ?? WebSocket.CLOSED
  }

  /** Connect to the agent WebSocket server */
  connect(): Promise<void> {
    if (this.destroyed) return Promise.reject(new Error('Instance destroyed'))
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return Promise.resolve()
    }

    this.clearReconnectTimeout()

    const url = `ws://${this.options.agentIp}`
    this.ws = new WebSocket(url)

    return new Promise((resolve, reject) => {
      if (!this.ws) return reject(new Error('WebSocket not created'))

      const onOpen = () => {
        this.options.onOpen?.()
        this.flushQueue()
        resolve()
      }

      const onError = (event: Event) => {
        this.options.onError?.(event)
        // If not yet opened, reject the connection promise
        if (this.ws?.readyState !== WebSocket.OPEN) {
          reject(new Error('WebSocket connection failed'))
        }
      }

      const onClose = (event: CloseEvent) => {
        this.options.onClose?.(event)
        this.scheduleReconnect(event)
      }

      const onMessage = (event: MessageEvent) => {
        this.handleMessage(event)
      }

      this.ws.onopen = onOpen
      this.ws.onerror = onError
      this.ws.onclose = onClose
      this.ws.onmessage = onMessage
    })
  }

  /** Disconnect and stop reconnection attempts */
  disconnect(): void {
    this.clearReconnectTimeout()
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
    this.sendQueue = []
  }

  /** Destroy the instance — no further reconnects possible */
  destroy(): void {
    this.destroyed = true
    this.disconnect()
    this.listeners.forEach((set) => set.clear())
  }

  /** Update connection options (agentIp, autoReconnect) — triggers reconnect if changed */
  updateOptions(newOptions: Partial<WSOptions>): void {
    const ipChanged = newOptions.agentIp !== undefined && newOptions.agentIp !== this.options.agentIp
    const reconnectChanged = newOptions.autoReconnect !== undefined && newOptions.autoReconnect !== this.options.autoReconnect

    this.options = { ...this.options, ...newOptions }

    if (ipChanged || (reconnectChanged && this.options.autoReconnect)) {
      this.disconnect()
      this.connect().catch(() => {}) // fire-and-forget; errors handled by onError/onClose
    }
  }

  /** Send a message (queues if disconnected) */
  send(msg: OutboundMessage): void {
    const data = JSON.stringify(msg)
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data)
    } else {
      this.sendQueue.push(msg)
    }
  }

  /** Subscribe to inbound message type with typed payload */
  on<K extends InboundMessageType>(
    type: K,
    handler: (payload: InboundPayloadMap[K]) => void
  ): () => void {
    const set = this.listeners.get(type)
    if (!set) throw new Error(`Unknown event type: ${type}`)
    set.add(handler as (payload: unknown) => void)
    return () => this.off(type, handler)
  }

  /** Unsubscribe from inbound message type */
  off<K extends InboundMessageType>(
    type: K,
    handler: (payload: InboundPayloadMap[K]) => void
  ): void {
    const set = this.listeners.get(type)
    if (set) set.delete(handler as (payload: unknown) => void)
  }

  // ============================================
  // Private methods
  // ============================================

  private handleMessage(event: MessageEvent): void {
    let raw: unknown
    try {
      raw = JSON.parse(event.data)
    } catch {
      return // silently drop invalid JSON
    }
    const msg = validateMessage(raw)
    if (!msg) return // silently drop invalid (per protocol.ts pattern)

    // Emit to typed listeners
    const set = this.listeners.get(msg.type as InboundMessageType)
    if (set) {
      set.forEach((handler) => handler(msg.payload))
    }

    // Also call generic onMessage if provided
    this.options.onMessage?.(msg)
  }

  private flushQueue(): void {
    while (this.sendQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const msg = this.sendQueue.shift()!
      this.ws.send(JSON.stringify(msg))
    }
  }

  private scheduleReconnect(event: CloseEvent): void {
    if (!this.options.autoReconnect || this.destroyed) return

    this.clearReconnectTimeout()
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null
      this.connect().catch(() => {}) // onError/onClose will handle retry
    }, 3000)
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
  }
}

// ============================================
// useAppDeckWS hook — React integration
// ============================================

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSettings } from '@/context/SettingsContext'

/** Singleton AppDeckWS instance (shared across hook instances) */
let wsInstance: AppDeckWS | null = null

function getOrCreateWSInstance(options: WSOptions): AppDeckWS {
  if (!wsInstance) {
    wsInstance = new AppDeckWS(options)
  } else {
    wsInstance.updateOptions(options)
  }
  return wsInstance
}

/** Test-only: reset the singleton instance */
export function __resetWSInstanceForTesting(): void {
  if (wsInstance) {
    wsInstance.destroy()
    wsInstance = null
  }
}

export function useAppDeckWS(): UseWSReturn {
  const { settings } = useSettings()

  // Reactive state for inbound data
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [lastAck, setLastAck] = useState<Ack | null>(null)
  const [lastError, setLastError] = useState<Ack | null>(null)
  const [config, setConfig] = useState<Config | null>(null)

  // Stable refs to latest state for send helpers
  const wsRef = useRef<AppDeckWS | null>(null)
  const statusRef = useRef(status)
  statusRef.current = status

  // Initialize or update WS instance when settings change
  useEffect(() => {
    const instance = getOrCreateWSInstance({
      agentIp: settings.agentIp,
      autoReconnect: settings.autoReconnect,
      onOpen: () => setStatus('connected'),
      onClose: () => {
        if (statusRef.current !== 'disconnected') {
          setStatus(settings.autoReconnect ? 'connecting' : 'disconnected')
        }
      },
      onError: () => setStatus('error'),
    })
    wsRef.current = instance

    // Subscribe to inbound messages
    const offMetrics = instance.on('metrics', (payload) => setMetrics(payload))
    const offAck = instance.on('ack', (payload) => setLastAck(payload))
    const offError = instance.on('error', (payload) => setLastError(payload))
    const offConfig = instance.on('config', (payload) => setConfig(payload))

    // Initial connection
    instance.connect().catch(() => {
      setStatus(settings.autoReconnect ? 'connecting' : 'error')
    })

    return () => {
      offMetrics()
      offAck()
      offError()
      offConfig()
      // Don't disconnect here — singleton persists across components
    }
  }, [settings.agentIp, settings.autoReconnect])

  // Send helpers
  const sendAction = useCallback((action: Action) => {
    wsRef.current?.send({ type: 'action', payload: action })
  }, [])

  const sendConfigGet = useCallback((key?: ConfigKey) => {
    wsRef.current?.send({ type: 'config', payload: { scope: 'get', key } })
  }, [])

  const sendConfigSet = useCallback((key: ConfigKey, value: string) => {
    wsRef.current?.send({ type: 'config', payload: { scope: 'set', key, value } })
  }, [])

  const connect = useCallback(() => {
    wsRef.current?.connect().catch(() => {})
  }, [])

  const disconnect = useCallback(() => {
    wsRef.current?.disconnect()
  }, [])

  return {
    status,
    readyState: wsRef.current?.readyState ?? WebSocket.CLOSED,
    metrics,
    lastAck,
    lastError,
    config,
    sendAction,
    sendConfigGet,
    sendConfigSet,
    connect,
    disconnect,
  }
}

// ============================================
// Re-export shared types for consumers
// ============================================

export type {
  Message,
  Metrics,
  Action,
  ActionName,
  ActionArgs,
  Config,
  ConfigMessage,
  ConfigKey,
  Ack,
} from 'shared'