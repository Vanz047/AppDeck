import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import type { Action } from '@/ws'
import { SettingsProvider } from '@/context/SettingsContext'
import { ActionButton, type ActionKind } from '@/components/ActionButton'

function renderWithSettings(ui: React.ReactElement) {
  return render(<SettingsProvider>{ui}</SettingsProvider>)
}

function clickButton(kind: ActionKind, sendAction: (a: Action) => void, testId?: string) {
  renderWithSettings(
    <ActionButton kind={kind} sendAction={sendAction} data-testid={testId} />,
  )
  const btn = screen.getByTestId(testId ?? `action-${kind}`)
  fireEvent.click(btn)
}

describe('ActionButton', () => {
  it('emits open-app discord when kind is discord', () => {
    const sendAction = vi.fn()
    clickButton('discord', sendAction)
    expect(sendAction).toHaveBeenCalledTimes(1)
    expect(sendAction).toHaveBeenCalledWith({ name: 'open-app', args: { app: 'discord' } })
  })

  it('emits open-app obs when kind is obs', () => {
    const sendAction = vi.fn()
    clickButton('obs', sendAction)
    expect(sendAction).toHaveBeenCalledTimes(1)
    expect(sendAction).toHaveBeenCalledWith({ name: 'open-app', args: { app: 'obs' } })
  })

  it('emits screenshot-full when kind is screenshot', () => {
    const sendAction = vi.fn()
    clickButton('screenshot', sendAction)
    expect(sendAction).toHaveBeenCalledTimes(1)
    expect(sendAction).toHaveBeenCalledWith({ name: 'screenshot-full', args: {} })
  })

  it('does not call sendAction when disabled', () => {
    const sendAction = vi.fn()
    renderWithSettings(
      <ActionButton kind="discord" sendAction={sendAction} disabled />,
    )
    const btn = screen.getByTestId('action-discord')
    fireEvent.click(btn)
    expect(sendAction).not.toHaveBeenCalled()
  })

  it('renders the i18n label for each kind', () => {
    renderWithSettings(<ActionButton kind="discord" sendAction={vi.fn()} />)
    expect(screen.getByText('Discord')).toBeInTheDocument()
  })
})
