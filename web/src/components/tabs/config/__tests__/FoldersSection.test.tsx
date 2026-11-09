import { render, screen, fireEvent } from '@testing-library/react'
import { FoldersSection } from '../FoldersSection'
import { SettingsProvider } from '@/context/SettingsContext'
import { vi } from 'vitest'

// Test wrapper with providers
function renderWithProviders(ui: React.ReactElement) {
  return render(
    <SettingsProvider>
      {ui}
    </SettingsProvider>
  )
}

describe('FoldersSection', () => {
  it('renders section with title', () => {
    renderWithProviders(
      <FoldersSection
        settings={{ screenshotDir: 'C:\\shots', clipDir: 'C:\\clips' } as any}
        updateSettings={vi.fn()}
        t={(key) => key}
      />
    )
    expect(screen.getByText('pastas')).toBeInTheDocument()
  })

  it('shows screenshot directory input', () => {
    renderWithProviders(
      <FoldersSection
        settings={{ screenshotDir: 'C:\\shots', clipDir: 'C:\\clips' } as any}
        updateSettings={vi.fn()}
        t={(key) => key}
      />
    )
    const input = screen.getByDisplayValue('C:\\shots')
    expect(input).toBeInTheDocument()
  })

  it('calls updateSettings on screenshot input change', () => {
    const updateSettings = vi.fn()
    renderWithProviders(
      <FoldersSection
        settings={{ screenshotDir: 'C:\\shots', clipDir: 'C:\\clips' } as any}
        updateSettings={updateSettings}
        t={(key) => key}
      />
    )
    const input = screen.getByDisplayValue('C:\\shots')
    fireEvent.change(input, { target: { value: 'D:\\new\\shots' } })
    expect(updateSettings).toHaveBeenCalledWith('screenshotDir', 'D:\\new\\shots')
  })

  it('calls updateSettings on clip input change', () => {
    const updateSettings = vi.fn()
    renderWithProviders(
      <FoldersSection
        settings={{ screenshotDir: 'C:\\shots', clipDir: 'C:\\clips' } as any}
        updateSettings={updateSettings}
        t={(key) => key}
      />
    )
    const input = screen.getByDisplayValue('C:\\clips')
    fireEvent.change(input, { target: { value: 'D:\\new\\clips' } })
    expect(updateSettings).toHaveBeenCalledWith('clipDir', 'D:\\new\\clips')
  })
})