import { useI18n } from '@/hooks/useI18n'
import type { Action } from '@/ws'

/** Kinds of deck action a button can trigger. */
export type ActionKind = 'discord' | 'obs' | 'screenshot'

const ICONS: Record<ActionKind, JSX.Element> = {
  discord: (
    <path d="M19.3 5.3A17 17 0 0 0 15 4l-.2.4a13 13 0 0 1 3.6 1.5 12 12 0 0 0-13 0A13 13 0 0 1 9 4.4L8.8 4a17 17 0 0 0-4.3 1.3C2.2 9.1 1.5 12.9 1.8 16.6A17 17 0 0 0 7 19l1-1.6c-.6-.2-1.2-.5-1.7-.8l.4-.3a12 12 0 0 0 10.6 0l.4.3c-.5.3-1.1.6-1.7.8L16 19a17 17 0 0 0 5.2-2.4c.4-4.4-.7-8.2-1.9-11.3Z" />
  ),
  obs: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </>
  ),
  screenshot: (
    <>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </>
  ),
}

const ACCENTS: Record<ActionKind, string> = {
  discord: 'var(--blue)',
  obs: 'var(--accent)',
  screenshot: 'var(--cyan)',
}

export interface ActionButtonProps {
  kind: ActionKind
  /** Sends an outbound action over the WS (from useAppDeckWS). */
  sendAction: (action: Action) => void
  /** Disables the button (opacity + pointer-events). */
  disabled?: boolean
  /** Extra classes for layout context (e.g. flex sizing inside a grid). */
  className?: string
  /** Data attribute forwarded to the <button>. */
  'data-testid'?: string
}

/**
 * Emits the matching `action` message on the agent WebSocket.
 *
 * - `discord` / `obs` → `open-app`
 * - `screenshot` → `screenshot-full`
 */
export function ActionButton({
  kind,
  sendAction,
  disabled = false,
  className = '',
  'data-testid': testId,
}: ActionButtonProps) {
  const { t } = useI18n()
  const accent = ACCENTS[kind]

  const handle = () => {
    if (disabled) return
    if (kind === 'screenshot') {
      sendAction({ name: 'screenshot-full', args: {} })
    } else {
      sendAction({ name: 'open-app', args: { app: kind } })
    }
  }

  const label =
    kind === 'discord' ? t('discord') : kind === 'obs' ? t('obs') : t('print')

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handle}
      data-testid={testId ?? `action-${kind}`}
      className={[
        'action-btn relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 bg-panel-3 px-4 py-4 text-xs font-bold text-text transition-all select-none active:scale-[.98]',
        className,
      ].join(' ')}
      style={{
        borderColor: accent,
        boxShadow: disabled ? 'none' : `0 6px 24px -10px ${accent}`,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-7 h-7"
        style={{ color: accent }}
        aria-hidden
      >
        {ICONS[kind]}
      </svg>
      <span>{label}</span>
    </button>
  )
}
