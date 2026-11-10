import { SectionCard } from '../../layout'
import { useI18n } from '@/hooks/useI18n'

export function SaveActions({
  saveToast,
  onSave,
  onResetAll,
}: {
  saveToast: boolean
  onSave: () => void
  onResetAll: () => void
}) {
  const { t } = useI18n()

  return (
    <div className="lg:col-span-2 flex gap-3">
      <button
        className="stream-btn flex-1"
        onClick={onSave}
        disabled={saveToast}
      >
        {saveToast ? t('configsSaved') : t('saveConfigs')}
      </button>
      <button
        className="stream-btn"
        style={{ background: 'rgba(248,113,113,.15)', color: '#f87171', borderColor: 'rgba(248,113,113,.35)' }}
        onClick={onResetAll}
      >
        {t('resetAll')}
      </button>
    </div>
  )
}