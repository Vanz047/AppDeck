import { describe, it, expect } from 'vitest'
import { validateMessage } from '../src/protocol'

describe('validateMessage', () => {
  it('accepts a valid metrics message', () => {
    const m = validateMessage({
      type: 'metrics',
      payload: { cpu: 42.0, ram: 55.0, ramUsedGB: 8.2, fps: 144, timestamp: '2026-11-03T00:00:00Z' },
    })
    expect(m?.type).toBe('metrics')
  })

  it('accepts a valid open-app action', () => {
    const a = validateMessage({
      type: 'action',
      payload: { name: 'open-app', args: { app: 'discord' } },
    })
    expect(a?.type).toBe('action')
  })

  it('rejects an open-app with unknown app', () => {
    const a = validateMessage({
      type: 'action',
      payload: { name: 'open-app', args: { app: 'unknown' } },
    })
    expect(a).toBeNull()
  })

  it('accepts a valid screenshot-full action', () => {
    const a = validateMessage({
      type: 'action',
      payload: { name: 'screenshot-full', args: {} },
    })
    expect(a?.type).toBe('action')
  })

  it('accepts a valid screenshot-crop action', () => {
    const a = validateMessage({
      type: 'action',
      payload: {
        name: 'screenshot-crop',
        args: { x: 0, y: 0, width: 640, height: 480 },
      },
    })
    expect(a?.type).toBe('action')
  })

  it('rejects a screenshot-crop with missing coords', () => {
    const a = validateMessage({
      type: 'action',
      payload: {
        name: 'screenshot-crop',
        args: { x: 0, y: 0 },
      },
    })
    expect(a).toBeNull()
  })

  it('accepts a valid add-game action', () => {
    const a = validateMessage({
      type: 'action',
      payload: {
        name: 'add-game',
        args: {
          exePath: 'C:\\Games\\Cyberpunk\\bin64\\cyberpunk2077_x64.exe',
          name: 'Cyberpunk 2077',
        },
      },
    })
    expect(a?.type).toBe('action')
  })

  it('rejects add-game without exePath', () => {
    const a = validateMessage({
      type: 'action',
      payload: { name: 'add-game', args: { name: 'Foo' } },
    })
    expect(a).toBeNull()
  })

  it('rejects add-game with empty exePath', () => {
    const a = validateMessage({
      type: 'action',
      payload: { name: 'add-game', args: { exePath: '' } },
    })
    expect(a).toBeNull()
  })

  it('accepts a valid launch-exe action', () => {
    const a = validateMessage({
      type: 'action',
      payload: {
        name: 'launch-exe',
        args: { exePath: 'C:\\Games\\Valorant\\VALORANT.exe' },
      },
    })
    expect(a?.type).toBe('action')
  })

  it('rejects launch-exe with missing exePath', () => {
    const a = validateMessage({
      type: 'action',
      payload: { name: 'launch-exe', args: {} },
    })
    expect(a).toBeNull()
  })

  it('accepts a valid key-down (BTN_N) action', () => {
    const a = validateMessage({
      type: 'action',
      payload: { name: 'key-down', args: { btn: 'BTN_1', holdMs: 50 } },
    })
    expect(a?.type).toBe('action')
  })

  it('accepts key-up with just btn', () => {
    const a = validateMessage({
      type: 'action',
      payload: { name: 'key-up', args: { btn: 'BTN_8' } },
    })
    expect(a?.type).toBe('action')
  })

  it('rejects key-down with a non-BTN id', () => {
    const a = validateMessage({
      type: 'action',
      payload: { name: 'key-down', args: { btn: 'mouse1', holdMs: 50 } },
    })
    expect(a).toBeNull()
  })

  it('rejects key-up with missing btn', () => {
    const a = validateMessage({
      type: 'action',
      payload: { name: 'key-up', args: {} },
    })
    expect(a).toBeNull()
  })

  it('accepts a config.set for games', () => {
    const c = validateMessage({
      type: 'config',
      payload: { scope: 'set', key: 'games', value: '[]' },
    })
    expect(c?.type).toBe('config')
  })

  it('accepts a valid config.get', () => {
    const c = validateMessage({
      type: 'config',
      payload: { scope: 'get' },
    })
    expect(c?.type).toBe('config')
  })

  it('accepts a valid config.set', () => {
    const c = validateMessage({
      type: 'config',
      payload: { scope: 'set', key: 'screenshotDir', value: 'C:\\X' },
    })
    expect(c?.type).toBe('config')
  })

  it('accepts a valid ack', () => {
    const a = validateMessage({
      type: 'ack',
      payload: { for_: 'action', ok: true, detail: 'discord opened' },
    })
    expect(a?.type).toBe('ack')
  })

  it('accepts a valid error', () => {
    const e = validateMessage({
      type: 'error',
      payload: { for_: 'action', ok: false, detail: 'app not found' },
    })
    expect(e?.type).toBe('error')
  })

  it('rejects unknown types', () => {
    expect(validateMessage({ type: 'bogus', payload: {} })).toBeNull()
  })

  it('rejects non-object input', () => {
    expect(validateMessage('hello')).toBeNull()
    expect(validateMessage(null)).toBeNull()
    expect(validateMessage(42)).toBeNull()
  })

  it('rejects metrics with missing fields', () => {
    expect(validateMessage({ type: 'metrics', payload: { cpu: 1 } })).toBeNull()
  })
})
