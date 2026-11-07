import { describe, it, expect } from 'vitest'
import {
  validateMessage,
  Metrics,
  Ack,
  Config,
} from '../src/protocol'

describe('shared/protocol (smoke)', () => {
  it('exposes the Metrics interface', () => {
    const sample: Metrics = {
      cpu: 1,
      ram: 1,
      ramUsedGB: 1,
      fps: -1,
      timestamp: '2026-11-03T00:00:00Z',
    }
    expect(sample.cpu).toBe(1)
    expect(sample.fps).toBe(-1)
  })

  it('exposes the Ack interface', () => {
    const ack: Ack = {
      for_: 'action',
      ok: true,
      detail: 'discord opened',
    }
    expect(ack.for_).toBe('action')
    expect(ack.ok).toBe(true)
  })

  it('exposes the Config interface', () => {
    const cfg: Config = {
      screenshotDir: 'C:\\Users\\user\\AppDeck\\shots',
      clipDir: 'C:\\Users\\user\\AppDeck\\clips',
    }
    expect(cfg.screenshotDir).toContain('AppDeck')
  })
})
