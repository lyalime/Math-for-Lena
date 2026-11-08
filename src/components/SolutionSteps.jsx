import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import MathText from './MathText'

// Lời giải mở dần từng bước (hoặc mở hết)
export default function SolutionSteps({ steps = [], initial = 0, title = 'Lời giải', allAtOnce = false }) {
  const [n, setN] = useState(allAtOnce ? steps.length : initial)
  return (
    <div>
      <div className="font-hand mb-1 text-[15px] font-semibold text-ink-soft">{title}</div>
      <ol className="space-y-1.5">
        <AnimatePresence initial={false}>
          {steps.slice(0, n).map((s, i) => (
            <motion.li
              key={i}
              className="flex gap-2"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <span className="font-hand mt-[1px] flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-line text-[12px] font-bold">
                {i + 1}
              </span>
              <MathText className="math-scroll min-w-0 flex-1" as="div">
                {s}
              </MathText>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
      {n < steps.length && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-sketch btn-primary !py-1.5 text-sm" onClick={() => setN(n + 1)}>
            {n === 0 ? 'Xem bước 1' : `Bước tiếp (${n + 1}/${steps.length})`}
          </button>
          {steps.length - n > 1 && (
            <button className="btn-sketch !py-1.5 text-sm" onClick={() => setN(steps.length)}>
              Xem hết
            </button>
          )}
        </div>
      )}
    </div>
  )
}
