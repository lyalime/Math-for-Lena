import { motion } from 'framer-motion'

// Thanh tiến độ như được tô bằng bút dạ quang: mép răng cưa, hơi nghiêng, "tô" dần khi xuất hiện.
export default function HighlightBar({ value = 0, color = 'yellow', height = 14, label, className = '' }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100)
  return (
    <div className={className}>
      <div
        className="relative w-full"
        style={{ height }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Tiến độ'}
      >
        <svg className="absolute inset-0 h-full w-full text-ink-soft" preserveAspectRatio="none" viewBox="0 0 100 10" aria-hidden="true">
          <path d="M0.8 1.2 L99.2 0.8 L99.4 9 L0.6 9.3 Z" fill="none" stroke="currentColor" strokeWidth="0.6" vectorEffect="non-scaling-stroke" strokeDasharray="3 2" opacity="0.6" />
        </svg>
        <motion.div
          className="absolute inset-y-[2px] left-[2px]"
          style={{
            background: `var(--hl-${color})`,
            mixBlendMode: 'var(--hl-blend)',
            clipPath: 'polygon(0 12%, 3% 0, 97% 6%, 100% 18%, 99% 84%, 96% 100%, 4% 92%, 0 80%)',
            transform: 'skewX(-8deg)',
            opacity: 0.92,
          }}
          initial={{ width: 0 }}
          animate={{ width: `calc(${pct}% - 4px)` }}
          transition={{ duration: 0.9, ease: [0.3, 0.7, 0.2, 1] }}
        />
      </div>
    </div>
  )
}
