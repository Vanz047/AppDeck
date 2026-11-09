import { SectionCard } from '../../layout'

export function SaveActions({
  saveToast,
  onSave,
  onResetAll,
  t,
}: {
  saveToast: boolean
  onSave: () => void
  onResetAll: () => void
  t: (key: string) => string
}) {
  return (
    <div className="lg:col-span-2 flex gap-3">
      <button
        className="stream-btn flex-1"
        onClick={onSave}
        disabled={saveToast}
      >
        {saveToast ? t('saveSaved') : t('saveConfigurations')}
      </button>
      <button
        className="stream-btn"
        style={{ background: 'rgba(248,113,113,.15)', color: '#f87171', borderColor: 'rgba(248,113,113,.35)' }}
        onClick={onResetAll}
      >
        Resetar tudo
      </button>
    </div>
  )
}