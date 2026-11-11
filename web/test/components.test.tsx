// web/test/components.test.tsx — render tests for CpuCard, RamCard, FpsCard
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SettingsProvider } from '@/context/SettingsContext'
import { CpuCard } from '@/components/CpuCard'
import { RamCard } from '@/components/RamCard'
import { FpsCard, fpsValue } from '@/components/FpsCard'

/** Wrap with SettingsProvider so useI18n resolves language from context. */
function withSettings(ui: React.ReactNode) {
  return render(
    <SettingsProvider>{ui}</SettingsProvider>
  )
}

// ---------------------------------------------------------------------------
// fpsValue helper
// ---------------------------------------------------------------------------

describe('fpsValue', () => {
  it('returns the number as a string when fps > 0', () => {
    expect(fpsValue(60)).toBe('60')
    expect(fpsValue(144)).toBe('144')
  })
  it('returns "—" when fps is -1 (not detected)', () => {
    expect(fpsValue(-1)).toBe('—')
  })
  it('returns "—" when fps is 0 (no data yet)', () => {
    expect(fpsValue(0)).toBe('—')
  })
})

// ---------------------------------------------------------------------------
// CpuCard
// ---------------------------------------------------------------------------

describe('CpuCard', () => {
  it('renders the CPU percentage', () => {
    withSettings(<CpuCard cpuPct={42} />)
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('CPU')).toBeInTheDocument()
  })

  it('rounds decimal CPU values to the nearest integer', () => {
    withSettings(<CpuCard cpuPct={42.7} />)
    expect(screen.getByText('43')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// RamCard
// ---------------------------------------------------------------------------

describe('RamCard', () => {
  it('renders RAM percentage and used GB', () => {
    withSettings(<RamCard ramPct={61} ramUsedGB={9.8} />)
    expect(screen.getByText('61')).toBeInTheDocument()
    expect(screen.getByText('9.8 GB used')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// FpsCard
// ---------------------------------------------------------------------------

describe('FpsCard', () => {
  it('shows the FPS number when a real value is present', () => {
    withSettings(<FpsCard fps={120} status="connected" />)
    const value = screen.getByTestId('fps-value')
    expect(value.textContent).toBe('120')
  })

  it('shows "—" when fps === -1 (process not detected)', () => {
    withSettings(<FpsCard fps={-1} status="connected" />)
    const value = screen.getByTestId('fps-value')
    expect(value.textContent).toBe('—')
  })

  it('shows "—" when fps === 0 (no data yet)', () => {
    withSettings(<FpsCard fps={0} status="disconnected" />)
    const value = screen.getByTestId('fps-value')
    expect(value.textContent).toBe('—')
  })
})
