import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { allQuestions, chapters, isReady } from '../data'
import { useProgress } from '../lib/progress'
import { formatTime, isCorrect, present, shuffle } from '../lib/quiz'
import { Chip, PageTitle } from '../components/Layout'
import QuestionCard from '../components/QuestionCard'
import Result from '../components/Result'

const COUNTS = [10, 15, 20]

// Trộn đề cân bằng độ khó: ~40% dễ, 40% TB, 20% khó (nếu đủ câu)
function buildExam(pool, n) {
  const by = { de: shuffle(pool.filter((q) => q.difficulty === 'de')), tb: shuffle(pool.filter((q) => q.difficulty === 'tb')), kho: shuffle(pool.filter((q) => q.difficulty === 'kho')) }
  const want = { de: Math.round(n * 0.4), tb: Math.round(n * 0.4), kho: n - Math.round(n * 0.4) * 2 }
  let picked = [...by.de.splice(0, want.de), ...by.tb.splice(0, want.tb), ...by.kho.splice(0, want.kho)]
  const rest = shuffle([...by.de, ...by.tb, ...by.kho])
  while (picked.length < n && rest.length) picked.push(rest.pop())
  return shuffle(picked).map((q) => present(q))
}

export default function Exam() {
  const ready = chapters.filter(isReady)
  const [sel, setSel] = useState(ready.map((c) => c.id))
  const [count, setCount] = useState(10)
  const [minutes, setMinutes] = useState(15)
  const [exam, setExam] = useState(null)
  const pool = useMemo(() => allQuestions.filter((q) => sel.includes(q.chapter)), [sel])
  const n = Math.min(count, pool.length)

  if (exam?.done) {
    return (
      <div>
        <PageTitle kicker="Thi thử">Kết quả bài thi</PageTitle>
        <Result items={exam.done.items} seconds={exam.done.seconds} title={`Thi thử · ${exam.items.length} câu · ${exam.minutes} phút`} onRetry={() => setExam(null)} retryLabel="Thi đề mới" />
      </div>
    )
  }
  if (exam) return <ExamRun exam={exam} setExam={setExam} />

  return (
    <div>
      <PageTitle kicker="Chế độ thi thử" sub="Đề trộn ngẫu nhiên, có đồng hồ đếm ngược. Nộp bài mới biết kết quả.">
        Vào phòng <span className="hl hl-orange">thi</span>
      </PageTitle>
      <div className="sketch space-y-5 p-5">
        <div>
          <div className="font-hand mb-2 text-[15px] font-bold text-ink-soft">Chương</div>
          <div className="flex flex-wrap gap-2">
            {chapters.map((c) => (
              <Chip
                key={c.id}
                active={sel.includes(c.id)}
                onClick={() => isReady(c) && setSel((s) => (s.includes(c.id) ? s.filter((x) => x !== c.id) : [...s, c.id]))}
              >
                {c.id}. {c.short}
                {!isReady(c) && <span className="ml-1 text-[11px] text-ink-soft">(sắp có)</span>}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <div className="font-hand mb-2 text-[15px] font-bold text-ink-soft">Số câu</div>
          <div className="flex flex-wrap gap-2">
            {COUNTS.map((k) => (
              <Chip key={k} active={count === k} onClick={() => setCount(k)}>
                {k} câu
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <div className="font-hand mb-2 text-[15px] font-bold text-ink-soft">Thời gian</div>
          <div className="flex flex-wrap gap-2">
            {[10, 15, 20, 30, 60].map((k) => (
              <Chip key={k} active={minutes === k} onClick={() => setMinutes(k)}>
                {k} phút
              </Chip>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t-2 border-dashed border-line/30 pt-4">
          <button
            className="btn-sketch btn-primary"
            disabled={!n}
            onClick={() => setExam({ items: buildExam(pool, n), answers: {}, minutes, startedAt: Date.now() })}
          >
            Bắt đầu thi · {n} câu / {minutes} phút
          </button>
          {pool.length < count && pool.length > 0 && <span className="text-sm text-ink-soft">Kho câu hỏi mới có {pool.length} câu cho phạm vi này.</span>}
        </div>
      </div>
    </div>
  )
}

function ExamRun({ exam, setExam }) {
  const { recordAnswer, recordExam } = useProgress()
  const total = exam.minutes * 60
  const [left, setLeft] = useState(() => total - Math.floor((Date.now() - exam.startedAt) / 1000))
  const [answers, setAnswers] = useState(exam.answers)
  const refs = useRef([])
  const submitted = useRef(false)

  const submit = useCallback(() => {
    if (submitted.current) return
    submitted.current = true
    const items = exam.items.map((it) => {
      const response = answers[it.q.id]
      const correct = isCorrect(it.q, response)
      recordAnswer(it.q.id, correct)
      return { q: it.q, item: it, response, correct }
    })
    const seconds = Math.min(total, Math.round((Date.now() - exam.startedAt) / 1000))
    recordExam({ total: items.length, right: items.filter((x) => x.correct).length, seconds })
    setExam({ ...exam, done: { items, seconds } })
    window.scrollTo(0, 0)
  }, [answers, exam, recordAnswer, recordExam, setExam, total])

  useEffect(() => {
    const id = setInterval(() => setLeft(total - Math.floor((Date.now() - exam.startedAt) / 1000)), 500)
    return () => clearInterval(id)
  }, [exam.startedAt, total])

  useEffect(() => {
    if (left <= 0) submit()
  }, [left, submit])

  const answered = exam.items.filter((it) => answers[it.q.id] != null && answers[it.q.id] !== '').length
  const urgent = left <= 60

  return (
    <div className="mx-auto max-w-2xl">
      <div className="sticky top-14 z-20 -mx-1 mb-4 bg-paper/90 px-1 py-2 backdrop-blur">
        <div className="sketch-soft flex items-center gap-3 px-3 py-2">
          <motion.span
            className={`font-hand text-2xl font-bold tabular-nums ${urgent ? 'text-bad' : ''}`}
            animate={urgent ? { scale: [1, 1.08, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
            aria-live="polite"
          >
            ⏱ {formatTime(left)}
          </motion.span>
          <span className="text-sm text-ink-soft">
            Đã làm {answered}/{exam.items.length}
          </span>
          <span className="flex-1" />
          <button
            className="btn-sketch btn-primary !py-1.5"
            onClick={() => {
              if (answered < exam.items.length && !window.confirm(`Bạn mới làm ${answered}/${exam.items.length} câu. Vẫn nộp bài?`)) return
              submit()
            }}
          >
            Nộp bài
          </button>
        </div>
        <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto pb-1">
          {exam.items.map((it, i) => {
            const done = answers[it.q.id] != null && answers[it.q.id] !== ''
            return (
              <button
                key={it.q.id}
                onClick={() => refs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                className={`font-hand h-8 min-w-8 shrink-0 rounded-md border-[1.5px] border-line px-1 text-sm font-bold ${done ? 'bg-hl-yellow text-[#1d2026]' : 'bg-card'}`}
                aria-label={`Tới câu ${i + 1}${done ? ' (đã làm)' : ''}`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-5">
        {exam.items.map((it, i) => (
          <div key={it.q.id} ref={(el) => (refs.current[i] = el)} className="scroll-mt-40">
            <QuestionCard
              item={it}
              index={i}
              total={exam.items.length}
              mode="exam"
              response={answers[it.q.id]}
              onAnswer={(v) => setAnswers((a) => ({ ...a, [it.q.id]: v }))}
            />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <button className="btn-sketch btn-primary" onClick={submit}>
          Nộp bài
        </button>
      </div>
    </div>
  )
}
