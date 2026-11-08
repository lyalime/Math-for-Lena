import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'

// Con dấu "ĐÚNG ✓" / "SAI ✗" đóng xuống thẻ
export function Stamp({ show, correct }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={correct ? 'ok' : 'bad'}
          className="pointer-events-none absolute right-3 top-3 z-10 select-none"
          initial={{ scale: 2.6, opacity: 0, rotate: -30 }}
          animate={{ scale: 1, opacity: 0.92, rotate: -14 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 520, damping: 20 }}
        >
          <div
            className="font-hand flex h-[70px] w-[70px] flex-col items-center justify-center rounded-full text-center leading-none"
            style={{
              color: correct ? 'var(--ok)' : 'var(--bad)',
              border: `3.5px double ${correct ? 'var(--ok)' : 'var(--bad)'}`,
              boxShadow: `inset 0 0 0 2px color-mix(in srgb, ${correct ? 'var(--ok)' : 'var(--bad)'} 25%, transparent)`,
            }}
          >
            <span className="text-2xl font-bold">{correct ? '✓' : '✗'}</span>
            <span className="text-[11px] font-bold tracking-wider">{correct ? 'ĐÚNG' : 'SAI'}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const BITS = ['✓', '+', '×', 'π', '√', '★', '∑', '=']
const COLORS = ['var(--hl-yellow)', 'var(--hl-pink)', 'var(--hl-green)', 'var(--hl-blue)', 'var(--hl-orange)']

// Confetti nhỏ bằng ký hiệu toán
export function Confetti({ fire }) {
  const parts = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        t: BITS[i % BITS.length],
        c: COLORS[i % COLORS.length],
        x: (Math.random() - 0.5) * 260,
        y: -60 - Math.random() * 140,
        r: (Math.random() - 0.5) * 360,
      })),
    // tạo lại mỗi lần bắn
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fire],
  )
  return (
    <AnimatePresence>
      {fire ? (
        <div key={fire} className="pointer-events-none absolute left-1/2 top-1/2 z-20" aria-hidden="true">
          {parts.map((p) => (
            <motion.span
              key={p.id}
              className="font-hand absolute text-lg font-bold"
              style={{ color: p.c, textShadow: '0 1px 0 rgba(0,0,0,.25)' }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.6, rotate: 0 }}
              animate={{ x: p.x, y: [0, p.y, p.y + 120], opacity: [1, 1, 0], scale: 1.1, rotate: p.r }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
            >
              {p.t}
            </motion.span>
          ))}
        </div>
      ) : null}
    </AnimatePresence>
  )
}

export const shake = { x: [0, -10, 9, -7, 5, -2, 0], transition: { duration: 0.45 } }
