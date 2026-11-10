import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { SaveActions } from '../SaveActions'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SettingsProvider } from '@/context/SettingsContext'

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <SettingsProvider>
      {ui}
    </SettingsProvider>
  )
}

describe('SaveActions', () => {
  beforeEach(cleanup)

  it('renders save button with default state', () => {
    renderWithProviders(
      <SaveActions
        saveToast={false}
        onSave={vi.fn()}
        onResetAll={vi.fn()}
      />
    )
    expect(screen.getByText('Salvar configurações')).toBeInTheDocument()
  })

  it('shows toast state when saveToast is true', () => {
    renderWithProviders(
      <SaveActions
        saveToast={true}
        onSave={vi.fn()}
        onResetAll={vi.fn()}
      />
    )
    expect(screen.getByText('Configurações salvas!')).toBeInTheDocument()
  })

  it('calls onSave when save button clicked', () => {
    const onSave = vi.fn()
    renderWithProviders(
      <SaveActions
        saveToast={false}
        onSave={onSave}
        onResetAll={vi.fn()}
      />
    )
    const saveBtn = screen.getByText('Salvar configurações')
    fireEvent.click(saveBtn)
    expect(onSave).toHaveBeenCalled()
  })

  it('calls onResetAll when reset button clicked', () => {
    const onResetAll = vi.fn()
    renderWithProviders(
      <SaveActions
        saveToast={false}
        onSave={vi.fn()}
        onResetAll={onResetAll}
      />
    )
    const resetBtn = screen.getByText('Resetar tudo')
    fireEvent.click(resetBtn)
    expect(onResetAll).toHaveBeenCalled()
  })

  it('disables save button when saveToast is true', () => {
    renderWithProviders(
      <SaveActions
        saveToast={true}
        onSave={vi.fn()}
        onResetAll={vi.fn()}
      />
    )
    const saveBtn = screen.getByText('Configurações salvas!')
    expect(saveBtn.closest('button')).toBeDisabled()
  })
})