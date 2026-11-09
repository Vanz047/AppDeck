import { render, screen, fireEvent } from '@testing-library/react'
import { SaveActions } from '../SaveActions'
import { vi } from 'vitest'

describe('SaveActions', () => {
  it('renders save button with default state', () => {
    render(
      <SaveActions
        saveToast={false}
        onSave={vi.fn()}
        onResetAll={vi.fn()}
        t={(key) => key}
      />
    )
    expect(screen.getByText('saveConfigurations')).toBeInTheDocument()
  })

  it('shows toast state when saveToast is true', () => {
    render(
      <SaveActions
        saveToast={true}
        onSave={vi.fn()}
        onResetAll={vi.fn()}
        t={(key) => key}
      />
    )
    expect(screen.getByText('saveSaved')).toBeInTheDocument()
  })

  it('calls onSave when save button clicked', () => {
    const onSave = vi.fn()
    render(
      <SaveActions
        saveToast={false}
        onSave={onSave}
        onResetAll={vi.fn()}
        t={(key) => key}
      />
    )
    const saveBtn = screen.getByText('saveConfigurations')
    fireEvent.click(saveBtn)
    expect(onSave).toHaveBeenCalled()
  })

  it('calls onResetAll when reset button clicked', () => {
    const onResetAll = vi.fn()
    render(
      <SaveActions
        saveToast={false}
        onSave={vi.fn()}
        onResetAll={onResetAll}
        t={(key) => key}
      />
    )
    const resetBtn = screen.getByText('Resetar tudo')
    fireEvent.click(resetBtn)
    expect(onResetAll).toHaveBeenCalled()
  })

  it('disables save button when saveToast is true', () => {
    render(
      <SaveActions
        saveToast={true}
        onSave={vi.fn()}
        onResetAll={vi.fn()}
        t={(key) => key}
      />
    )
    const saveBtn = screen.getByText('saveSaved')
    expect(saveBtn.closest('button')).toBeDisabled()
  })
})