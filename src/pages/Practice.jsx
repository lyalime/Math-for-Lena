import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { allQuestions, chapters, DIFFICULTY, getQuestion, isReady } from '../data'
import { useProgress } from '../lib/progress'
import { isCorrect, present, shuffle } from '../lib/quiz'
import { go } from '../lib/router'
import { Chip, PageTitle } from '../components/Layout'
import QuestionCard from '../components/QuestionCard'
import Result from '../components/Result'
import HighlightBar from '../components/HighlightBar'

export default function Practice({ query }) {
  const { p, recordAnswer } = useProgress()
  const wrongMode = query.wrong === '1'
  const [c, setC] = useState(query.c ? Number(query.c) : chapters.find(isReady)?.id)
  const [t, setT] = useState(query.t || '')
  const [d, setD] = useState(query.d || '')
  const [session, setSession] = useState(null)

  const pool = useMemo(() => {
    if (wrongMode) return Object.keys(p.wrong).map(getQuestion).filter(Boolean)
    return allQuestions.filter((q) => q.chapter === c && (!t || q.topic === t) && (!d || q.difficulty === d))
    // chỉ tính pool khi bắt đầu; p.wrong thay đổi trong phiên không làm đổi pool
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wrongMode, c, t, d, session == null])

  const start = () =>
    setSession({ items: shuffle(pool).map((q) => present(q)), i: 0, response: null, revealed: false, log: [], startedAt: Date.now(), endedAt: null })

  useEffect(() => {
    if (wrongMode && !session && pool.length) start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (session?.endedAt) {
    return (
      <div>
        <PageTitle kicker={wrongMode ? 'Sổ câu sai' : 'Chế độ luyện tập'}>Tổng kết lượt luyện</PageTitle>
        <Result items={session.log} seconds={(session.endedAt - session.startedAt) / 1000} title="Luyện tập" onRetry={() => setSession(null)} retryLabel="Luyện lượt mới" />
      </div>
    )
  }

  if (session) return <Session session={session} setSession={setSession} recordAnswer={recordAnswer} wrongMode={wrongMode} p={p} />

  const chapter = chapters.find((x) => x.id === c)
  return (
    <div>
      <PageTitle kicker="Chế độ luyện tập" sub="Trả lời xong là biết ngay đúng/sai kèm lời giải từng bước.">
        Luyện <span className="hl hl-blue">từng câu</span>
      </PageTitle>

      <div className="sketch space-y-5 p-5">
        <Field label="Chương">
          {chapters.map((x) => (
            <Chip
              key={x.id}
              active={c === x.id}
              onClick={() => {
                if (!isReady(x)) return
                setC(x.id)
                setT('')
              }}
            >
              {x.id}. {x.short}
              {!isReady(x) && <span className="ml-1 text-[11px] text-ink-soft">(sắp có)</span>}
            </Chip>
          ))}
        </Field>
        {chapter && (
          <Field label="Chủ đề">
            <Chip active={!t} onClick={() => setT('')}>
              Tất cả
            </Chip>
            {chapter.topics.map((x) => (
              <Chip key={x.id} active={t === x.id} onClick={() => setT(x.id)}>
                {x.title}
              </Chip>
            ))}
          </Field>
        )}
        <Field label="Độ khó">
          <Chip active={!d} onClick={() => setD('')}>
            Tất cả
          </Chip>
          {Object.entries(DIFFICULTY).map(([k, v]) => (
            <Chip key={k} active={d === k} onClick={() => setD(k)}>
              {v.label}
            </Chip>
          ))}
        </Field>
        <div className="flex flex-wrap items-center gap-3 border-t-2 border-dashed border-line/30 pt-4">
          <button className="btn-sketch btn-primary" disabled={!pool.length} onClick={start}>
            Bắt đầu · {pool.length} câu
          </button>
          {!pool.length && <span className="text-sm text-ink-soft">Không có câu nào khớp bộ lọc.</span>}
          {Object.keys(p.wrong).length > 0 && (
            <button className="btn-sketch" onClick={() => go('/luyen-tap', { wrong: 1 })}>
              📕 Làm lại {Object.keys(p.wrong).length} câu sai
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <div className="font-hand mb-2 text-[15px] font-bold text-ink-soft">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Session({ session, setSession, recordAnswer, wrongMode, p }) {
  const { items, i, response, revealed, log } = session
  const item = items[i]
  const nextRef = useRef(null)

  const answer = (val, opts) => {
    if (revealed) return
    if (item.q.type === 'number' && !opts?.submit) return
    const correct = isCorrect(item.q, val)
    recordAnswer(item.q.id, correct)
    setSession({ ...session, response: val, revealed: true, log: [...log, { q: item.q, item, response: val, correct }] })
    setTimeout(() => nextRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 350)
  }
  const next = () => {
    if (i + 1 >= items.length) setSession({ ...session, endedAt: Date.now() })
    else setSession({ ...session, i: i + 1, response: null, revealed: false })
  }
  const right = log.filter((l) => l.correct).length
  const wr = p.wrong[item.q.id]

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center gap-3">
        <button className="font-hand text-[15px] text-ink-soft hover:underline" onClick={() => setSession({ ...session, endedAt: Date.now() })}>
          ✕ Dừng
        </button>
        <HighlightBar value={(i + (revealed ? 1 : 0)) / items.length} className="flex-1" color="blue" label="Tiến độ lượt luyện" />
        <span className="font-hand text-sm font-bold">
          ✓ {right}/{log.length}
        </span>
      </div>
      {wrongMode && wr && (
        <p className="mb-2 text-[13px] text-ink-soft">
          Sổ câu sai: đã đúng liên tiếp {wr.streak}/2 lần — đúng thêm {2 - wr.streak} lần nữa là rời sổ.
        </p>
      )}
      <AnimatePresence mode="wait">
        <motion.div key={item.q.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
          <QuestionCard item={item} index={i} total={items.length} mode="practice" response={response} revealed={revealed} onAnswer={answer} />
        </motion.div>
      </AnimatePresence>
      <div ref={nextRef} className="mt-4 flex justify-end">
        {revealed && (
          <button className="btn-sketch btn-primary" onClick={next} autoFocus>
            {i + 1 >= items.length ? 'Xem tổng kết →' : 'Câu tiếp →'}
          </button>
        )}
      </div>
    </div>
  )
}
