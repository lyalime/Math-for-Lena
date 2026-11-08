import { motion, useAnimationControls } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import MathText from './MathText'
import SolutionSteps from './SolutionSteps'
import { AiBadge, DiffBadge, TypeBadge } from './Badges'
import { Confetti, Stamp, shake } from './Effects'
import { answerText, isCorrect } from '../lib/quiz'
import { getTopic } from '../data'

const LETTERS = ['A', 'B', 'C', 'D']

/**
 * mode: 'practice' (chấm ngay) | 'exam' (chỉ chọn) | 'review' (xem lại sau khi nộp)
 * response: mcq → chỉ số gốc; tf → boolean; number → string
 */
export default function QuestionCard({ item, index, total, mode = 'practice', response, onAnswer, revealed = false }) {
  const { q, order } = item
  const controls = useAnimationControls()
  const [draft, setDraft] = useState(q.type === 'number' ? response ?? '' : '')
  const [burst, setBurst] = useState(0)
  const correct = revealed && isCorrect(q, response)
  const firstReveal = useRef(true)

  useEffect(() => {
    setDraft(q.type === 'number' ? response ?? '' : '')
    firstReveal.current = true
    // chỉ reset khi đổi câu
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.id])

  useEffect(() => {
    if (mode !== 'practice' || !revealed || !firstReveal.current) return
    firstReveal.current = false
    if (correct) setBurst(Date.now())
    else controls.start(shake)
  }, [revealed, correct, mode, controls])

  const locked = mode === 'review' || (mode === 'practice' && revealed)
  const topic = getTopic(q.topic)

  const choose = (val) => {
    if (locked) return
    onAnswer?.(val)
  }

  const optionState = (val) => {
    const picked = response === val
    if (!(revealed && (mode === 'practice' || mode === 'review'))) return picked ? 'picked' : 'idle'
    if (val === q.answer) return 'right'
    if (picked) return 'wrong'
    return 'idle'
  }

  const stateClass = {
    idle: '',
    picked: '!bg-hl-yellow !text-[#1d2026]',
    right: '!border-ok !bg-[color-mix(in_srgb,var(--ok)_16%,var(--card))]',
    wrong: '!border-bad !bg-[color-mix(in_srgb,var(--bad)_14%,var(--card))] line-through decoration-bad/60',
  }

  return (
    <motion.article animate={controls} className="sketch relative overflow-visible p-4 sm:p-6">
      <Stamp show={revealed && mode !== 'exam'} correct={correct} />
      <Confetti fire={burst} />

      <header className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 pr-16">
        {index != null && (
          <span className="font-hand text-lg font-bold">
            Câu {index + 1}
            {total ? <span className="text-ink-soft">/{total}</span> : null}
          </span>
        )}
        <DiffBadge d={q.difficulty} />
        <TypeBadge type={q.type} />
        {q.aiGenerated && <AiBadge source={q.source} />}
      </header>
      {topic && <div className="mb-2 text-[13px] text-ink-soft">Chủ đề: {topic.title}</div>}

      <MathText as="div" className="math-scroll mb-4 text-[17px] leading-relaxed">
        {q.prompt}
      </MathText>

      {q.type === 'mcq' && (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {order.map((orig, i) => (
            <button
              key={orig}
              onClick={() => choose(orig)}
              disabled={locked}
              className={`sketch-soft flex min-h-[52px] items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-[color-mix(in_srgb,var(--hl-yellow)_30%,var(--card))] disabled:hover:bg-card ${stateClass[optionState(orig)]}`}
            >
              <span className="font-hand flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-current text-sm font-bold">
                {LETTERS[i]}
              </span>
              <MathText className="math-scroll min-w-0">{q.options[orig]}</MathText>
            </button>
          ))}
        </div>
      )}

      {q.type === 'tf' && (
        <div className="grid grid-cols-2 gap-3">
          {[
            [true, 'Đúng', 'Đ'],
            [false, 'Sai', 'S'],
          ].map(([val, label, short]) => (
            <button
              key={label}
              onClick={() => choose(val)}
              disabled={locked}
              className={`sketch-soft font-hand flex h-14 items-center justify-center gap-2 text-lg font-bold transition-colors hover:bg-[color-mix(in_srgb,var(--hl-yellow)_30%,var(--card))] disabled:hover:bg-card ${stateClass[optionState(val)]}`}
            >
              <span className="text-xl">{short}</span> {label}
            </button>
          ))}
        </div>
      )}

      {q.type === 'number' && (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!locked && draft.trim()) onAnswer?.(draft.trim(), { submit: true })
          }}
        >
          <label className="font-hand text-lg font-bold" htmlFor={`in-${q.id}`}>
            Đáp số:
          </label>
          <input
            id={`in-${q.id}`}
            inputMode="decimal"
            autoComplete="off"
            value={draft}
            disabled={locked}
            onChange={(e) => {
              setDraft(e.target.value)
              if (mode === 'exam') onAnswer?.(e.target.value)
            }}
            placeholder="vd: -4 hoặc 0,5"
            className={`sketch-soft h-12 w-40 px-3 text-lg tabular-nums outline-none focus:shadow-[0_0_0_3px_var(--hl-yellow)] ${
              revealed && mode !== 'exam' ? (correct ? '!border-ok' : '!border-bad') : ''
            }`}
          />
          {mode === 'practice' && !revealed && (
            <button type="submit" className="btn-sketch btn-primary h-12" disabled={!draft.trim()}>
              Kiểm tra
            </button>
          )}
          <p className="w-full text-[12.5px] text-ink-soft">Số thập phân dùng dấu phẩy, phân số viết a/b.</p>
        </form>
      )}

      {revealed && mode !== 'exam' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 border-t-2 border-dashed border-line/40 pt-4"
        >
          <p className="mb-3 font-semibold">
            {correct ? (
              <span className="hl hl-green">Chính xác!</span>
            ) : (
              <>
                <span className="hl hl-pink">{response == null || response === '' ? 'Chưa trả lời.' : 'Chưa đúng.'}</span>{' '}
                Đáp án: <MathText>{answerText(q)}</MathText>
              </>
            )}
          </p>
          <SolutionSteps steps={q.solution} allAtOnce />
          {q.source && <p className="mt-3 text-[12.5px] italic text-ink-soft">Nguồn: {q.source}</p>}
        </motion.div>
      )}
    </motion.article>
  )
}
