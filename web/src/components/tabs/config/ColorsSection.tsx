import { SectionCard } from '../../layout'
import { useSettings } from '@/context/SettingsContext'
import { useI18n } from '@/hooks/useI18n'
import type { ThemePreset } from '@/context/SettingsContext'
import type { TabId } from '../../layout'

type ThemedTabId = 'global' | TabId

const THEMABLE_TABS = [
  { id: 'global', name: 'Todas as telas' },
  { id: 'perf', name: 'Desempenho' },
  { id: 'audio', name: 'Áudio' },
  { id: 'jogos', name: 'Jogos' },
  { id: 'discord', name: 'Discord' },
  { id: 'stream', name: 'Stream' },
  { id: 'config', name: 'Config' },
] as const satisfies readonly { id: ThemedTabId; name: string }[]

export function ColorsSection({
  presets,
  activePreset,
  effectiveTheme,
  themePreset,
  custom,
  targetTab,
  onTargetTabChange,
  onApplyPreset,
  onColorChange,
  onResetColors,
  t,
}: {
  presets: readonly ThemePreset[]
  activePreset: ThemePreset
  effectiveTheme: ThemePreset
  themePreset: string
  custom: boolean
  targetTab: 'global' | TabId
  onTargetTabChange: (tab: 'global' | TabId) => void
  onApplyPreset: (id: string) => void
  onColorChange: (field: keyof ThemePreset, value: string) => void
  onResetColors: () => void
  t: (key: string) => string
}) {
  return (
    <SectionCard title={t('colors')} className="lg:col-span-2">
      <div className="flex flex-col gap-4">
        {/* Target tab selector */}
        <div>
          <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1.5">
            {t('targetTab')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {THEMABLE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTargetTabChange(tab.id)}
                className={[
                  'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 text-xs font-semibold transition-all',
                  targetTab === tab.id
                    ? 'border-accent-2 bg-panel-3 text-text'
                    : 'border-border text-muted hover:text-text',
                ].join(' ')}
              >
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Presets */}
        <div>
          <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1.5">
            {t('preset')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => onApplyPreset(p.id)}
                className={[
                  'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 text-xs font-semibold transition-all',
                  themePreset === p.id && !custom
                    ? 'border-accent-2 bg-panel-3 text-text'
                    : 'border-border text-muted hover:text-text',
                ].join(' ')}
              >
                <div
                  className="w-5 h-5 rounded-full border-2 border-black/20"
                  style={{ background: p.accent }}
                />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom color pickers */}
        <div>
          <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1.5">
            {t('customTheme')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {([
              { key: 'bg', labelKey: 'colorBg', hex: effectiveTheme.bg },
              { key: 'panel3', labelKey: 'colorPanel', hex: effectiveTheme.panel3 },
              { key: 'accent', labelKey: 'colorAccent', hex: effectiveTheme.accent },
              { key: 'accent2', labelKey: 'colorAccent2', hex: effectiveTheme.accent2 },
            ] as const).map((field) => (
              <div key={field.key} className="flex flex-col gap-1">
                <span className="text-[10px] text-muted font-mono">{t(field.labelKey)}</span>
                <div className="relative w-full">
                  <input
                    type="color"
                    value={field.hex}
                    onChange={(e) => onColorChange(field.key as keyof typeof effectiveTheme, e.target.value)}
                    className="w-full h-9 rounded-lg border border-border cursor-pointer bg-panel-3 p-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {custom && (
          <button
            className="text-xs text-muted hover:text-text transition-colors self-start"
            onClick={onResetColors}
          >
            {t('resetColors')}
          </button>
        )}

        {/* Preview */}
        <div className="border-t border-border pt-3">
          <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1.5">
            {t('preview')}
          </label>
          <div className="flex gap-2 flex-wrap">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold text-white"
              style={{ background: effectiveTheme.accent }}
            >
              Aa
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold"
              style={{
                background: effectiveTheme.panel3,
                color: effectiveTheme.text,
                border: `1px solid ${effectiveTheme.border}`,
              }}
            >
              Bb
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold text-black"
              style={{ background: effectiveTheme.green }}
            >
              Cc
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${effectiveTheme.accent}, ${effectiveTheme.accent2})`,
              }}
            >
              Dd
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}