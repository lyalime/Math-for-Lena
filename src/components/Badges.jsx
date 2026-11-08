import { DIFFICULTY, TYPE_LABEL } from '../data'

export function AiBadge({ source }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-dashed border-ink-soft px-2 py-0.5 text-[11px] font-semibold text-ink-soft"
      title={source ? `Nguồn: ${source}. Nội dung/lời giải do AI soạn — cần kiểm tra lại.` : 'Do AI soạn — cần kiểm tra lại'}
    >
      ✎ AI tạo
    </span>
  )
}

export function DiffBadge({ d }) {
  const info = DIFFICULTY[d]
  if (!info) return null
  return <span className={`hl hl-${info.color} text-[12px] font-semibold`}>{info.label}</span>
}

export function TypeBadge({ type }) {
  return <span className="text-[12px] font-medium text-ink-soft">{TYPE_LABEL[type]}</span>
}
