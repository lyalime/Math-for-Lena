import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import boDe from '../data/bo-de.json'
import { useProgress } from '../lib/progress'
import { load, save } from '../lib/storage'
import { formatTime } from '../lib/quiz'
import { href } from '../lib/router'
import { countAnswered, emptyAnswers, fmt, gradeFull, shortAnswerOk, totalItems, TF_POINTS } from '../lib/fullExam'
import { PageTitle } from '../components/Layout'
import HighlightBar from '../components/HighlightBar'
import { Confetti } from '../components/Effects'
import { NotFound } from './ChapterPage'

const COLORS = ['yellow', 'pink', 'green', 'blue', 'orange']
const best = (list) => (list?.length ? Math.max(...list.map((x) => x.total / x.max)) : null)

export default function FullExams({ id }) {
  if (id) {
    const ex = boDe.exams.find((e) => e.id === id)
    return ex ? <ExamRun key={id} ex={ex} /> : <NotFound />
  }
  return <ExamList />
}

// ---------------- Danh sách đề ----------------
function ExamList() {
  const { p } = useProgress()
  const fe = p.fullExams || {}
  const withKey = boDe.exams.filter((e) => e.key)
  const done = withKey.filter((e) => fe[e.id]?.length)
  const bests = done.map((e) => best(fe[e.id]))
  const avg = bests.length ? bests.reduce((a, b) => a + b, 0) / bests.length : 0
  const submits = Object.values(fe).reduce((s, l) => s + l.length, 0)

  return (
    <div>
      <PageTitle kicker="Làm full đề" sub={`${boDe.exams.length} đề theo 5 chương, làm trên đề gốc. Điền phiếu trả lời rồi nộp bài để chấm tự động phần trắc nghiệm.`}>
        Bộ đề <span className="hl hl-orange">ôn theo chương</span>
      </PageTitle>

      <div className="mb-8 grid grid-cols-3 gap-3 sm:max-w-xl">
        <Stat big={`${done.length}/${withKey.length}`} label="Đề đã làm" />
        <Stat big={done.length ? `${Math.round(avg * 100)}%` : '—'} label="Điểm TB tốt nhất" />
        <Stat big={submits} label="Lượt nộp bài" />
      </div>

      {boDe.chapters.map((name, ci) => {
        const list = boDe.exams.filter((e) => e.chapter === ci + 1)
        const nd = list.filter((e) => fe[e.id]?.length).length
        return (
          <section key={ci} className="mb-8">
            <h2 className="font-hand mb-3 flex flex-wrap items-baseline gap-x-2 text-lg font-bold">
              <span className={`hl hl-${COLORS[ci]}`}>Chương {ci + 1}</span>
              <span className="chalk">{name}</span>
              <span className="ml-auto text-sm font-semibold text-ink-soft">
                {nd}/{list.length} đã làm
              </span>
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {list.map((e, i) => {
                const b = best(fe[e.id])
                const draft = load(`de:${e.id}`, null)
                let badge = <span className="text-ink-soft">Chưa làm</span>
                if (!e.key) badge = <span className="text-ink-soft">Không có đáp án</span>
                else if (b != null) badge = <span className={`hl ${b >= 0.8 ? 'hl-green' : 'hl-blue'} font-semibold`}>Tốt nhất {fmt(b * 7)}/7</span>
                else if (draft?.started && !draft.submitted) badge = <span className="hl hl-pink font-semibold">Đang làm dở</span>
                return (
                  <a
                    key={e.id}
                    href={href(`/de/${e.id}`)}
                    className="sketch-soft flex flex-col gap-1.5 p-3 no-underline transition-transform hover:-translate-y-0.5"
                    style={{ transform: `rotate(${i % 2 ? 0.4 : -0.4}deg)` }}
                  >
                    <span className="font-hand chalk text-[17px] font-bold">Đề số {e.num}</span>
                    <span className="text-[12.5px] text-ink-soft">
                      Trang {e.pages[0]}–{e.pages[1]}
                      {fe[e.id]?.length ? ` · ${fe[e.id].length} lần` : ''}
                    </span>
                    <HighlightBar value={b ?? 0} color={COLORS[ci]} height={10} label={`Điểm tốt nhất đề ${e.num}`} />
                    <span className="text-[12px]">{badge}</span>
                  </a>
                )
              })}
            </div>
          </section>
        )
      })}
      <p className="text-center text-[13px] text-ink-soft">Nguồn: {boDe.source}. Đáp án lấy từ bảng đáp án trong tài liệu.</p>
    </div>
  )
}

function Stat({ big, label }) {
  return (
    <div className="sketch-soft px-3 py-2.5">
      <div className="font-hand chalk text-2xl font-bold leading-tight">{big}</div>
      <div className="text-[12px] text-ink-soft">{label}</div>
    </div>
  )
}

// ---------------- Làm một đề ----------------
const newState = (key) => ({ ...emptyAnswers(key), submitted: false, elapsed: 0, started: false })

function ExamRun({ ex }) {
  const { p, recordFullExam } = useProgress()
  const K = ex.key
  const [st, setSt] = useState(() => {
    const saved = load(`de:${ex.id}`, null)
    return saved && saved.mcq ? saved : newState(K)
  })
  const [zoom, setZoom] = useState(() => load('zoom', 860))
  const [open, setOpen] = useState(false)
  const [burst, setBurst] = useState(0)
  const sheetRef = useRef(null)
  const idx = boDe.exams.indexOf(ex)
  const prev = boDe.exams[idx - 1]
  const next = boDe.exams[idx + 1]
  const history = (p.fullExams || {})[ex.id] || []

  useEffect(() => {
    save(`de:${ex.id}`, st)
  }, [st, ex.id])

  useEffect(() => {
    const t = setInterval(() => {
      if (document.hidden) return
      setSt((s) => (s.started && !s.submitted ? { ...s, elapsed: s.elapsed + 1 } : s))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const setZ = (z) => {
    const v = Math.max(480, Math.min(1400, z))
    setZoom(v)
    save('zoom', v)
  }

  const pick = (part, i, j, v) =>
    setSt((s) => {
      if (s.submitted) return s
      if (part === 'mcq') {
        const mcq = [...s.mcq]
        mcq[i] = mcq[i] === v ? null : v
        return { ...s, mcq, started: true }
      }
      const tf = s.tf.map((r) => [...r])
      tf[i][j] = tf[i][j] === v ? null : v
      return { ...s, tf, started: true }
    })

  const submit = () => {
    const n = countAnswered(st)
    const total = totalItems(K)
    if (n < total && !window.confirm(`Bạn mới trả lời ${n}/${total} ý. Vẫn nộp bài?`)) return
    const r = gradeFull(K, st)
    recordFullExam(ex.id, { total: r.total, max: r.max, seconds: st.elapsed })
    setSt((s) => ({ ...s, submitted: true }))
    if (r.total / r.max >= 0.8) setBurst(Date.now())
    sheetRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const r = K && st.submitted ? gradeFull(K, st) : null
  const answered = K ? countAnswered(st) : 0

  return (
    <div>
      <a href="#/de" className="font-hand text-[15px] text-ink-soft no-underline hover:underline">
        ← Bộ đề
      </a>
      <div className="mt-1 mb-4 flex flex-wrap items-center gap-3">
        <h1 className="font-hand chalk text-[28px] font-bold leading-tight">
          Chương {ex.chapter} · <span className="hl hl-orange">Đề số {ex.num}</span>
        </h1>
        <span className="flex-1" />
        <div className="hidden items-center gap-1.5 sm:flex">
          <button className="btn-sketch !h-9 !w-9 !p-0" onClick={() => setZ(zoom - 100)} aria-label="Thu nhỏ đề">
            −
          </button>
          <button className="btn-sketch !h-9 !w-9 !p-0" onClick={() => setZ(zoom + 100)} aria-label="Phóng to đề">
            +
          </button>
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Đề gốc */}
        <div className="min-w-0">
          <div className="mx-auto flex flex-col gap-4" style={{ maxWidth: zoom }}>
            {ex.imgs.map((im, i) => (
              <img
                key={im.src}
                src={im.src}
                width={im.w}
                height={im.h}
                alt={`Chương ${ex.chapter} đề ${ex.num} – trang ${i + 1}`}
                loading={i < 2 ? 'eager' : 'lazy'}
                className="block h-auto w-full rounded-md border-2 border-line bg-white shadow-[3px_4px_0_var(--shadow)] dark:brightness-[.93]"
                style={{ transform: `rotate(${i % 2 ? 0.25 : -0.25}deg)` }}
              />
            ))}
          </div>
          <div className="mx-auto mt-6 flex justify-between gap-3" style={{ maxWidth: zoom }}>
            {prev ? (
              <a className="btn-sketch" href={href(`/de/${prev.id}`)}>
                ← C{prev.chapter} · Đề {prev.num}
              </a>
            ) : (
              <span />
            )}
            {next ? (
              <a className="btn-sketch" href={href(`/de/${next.id}`)}>
                C{next.chapter} · Đề {next.num} →
              </a>
            ) : (
              <span />
            )}
          </div>
        </div>

        {/* Phiếu trả lời */}
        <AnimatePresence>
          {open && (
            <motion.div
              className="fixed inset-0 z-40 bg-black/35 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
          )}
        </AnimatePresence>
        <aside
          ref={sheetRef}
          className={`sketch fixed inset-x-0 bottom-0 z-50 max-h-[80dvh] overflow-y-auto !rounded-b-none transition-transform duration-300 lg:sticky lg:top-[72px] lg:z-auto lg:max-h-[calc(100dvh-90px)] lg:translate-y-0 lg:!rounded-b-[16px] ${
            open ? 'translate-y-0' : 'translate-y-[105%]'
          }`}
          aria-label="Phiếu trả lời"
        >
          <Confetti fire={burst} />
          <div className="sticky top-0 z-10 flex items-center gap-2 border-b-2 border-dashed border-line/30 bg-card px-4 py-3">
            <b className="font-hand text-lg">Phiếu trả lời</b>
            {K && (
              <span className="rounded-full border-[1.5px] border-line px-2 text-[12px] font-semibold">
                {answered}/{totalItems(K)}
              </span>
            )}
            <span className="flex-1" />
            {K && <span className="font-hand font-bold tabular-nums text-ink-soft">⏱ {formatTime(st.elapsed)}</span>}
            <button className="ml-1 h-8 w-8 rounded-full border-[1.5px] border-line lg:hidden" onClick={() => setOpen(false)} aria-label="Đóng phiếu">
              ✕
            </button>
          </div>

          {!K ? (
            <p className="p-4 text-ink-soft">Đề này trong tài liệu gốc không kèm bảng đáp án nên không chấm tự động được. Bạn vẫn có thể xem và tự làm đề.</p>
          ) : (
            <>
              {r && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="border-b-2 border-dashed border-line/30 px-4 py-4">
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 2, rotate: -25, opacity: 0 }}
                      animate={{ scale: 1, rotate: -8, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 16 }}
                      className="font-hand flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-[3px] border-double border-bad leading-none text-bad"
                    >
                      <span className="text-2xl font-bold">{fmt(r.total)}</span>
                      <span className="text-xs font-bold">/ {fmt(r.max)}</span>
                    </motion.div>
                    <div className="text-[14px]">
                      <div className="font-hand text-lg font-bold">Điểm trắc nghiệm</div>
                      <div>Phần I: <b>{r.mcqN}/{K.mcq.length}</b> câu</div>
                      <div>Phần II: <b>{fmt(r.tfPts)}</b> điểm</div>
                      <div>Phần III: <b>{r.saN}/{K.sa.length}</b> câu</div>
                    </div>
                  </div>
                </motion.div>
              )}

              <Section title="Phần I · Nhiều lựa chọn" note="0,25đ/câu">
                {K.mcq.map((key, i) => (
                  <Row key={i} label={`${i + 1}.`} mark={r ? st.mcq[i] === key : null}>
                    {['A', 'B', 'C', 'D'].map((o) => (
                      <Opt key={o} v={o} picked={st.mcq[i] === o} keyV={key} done={!!r} onClick={() => pick('mcq', i, null, o)} label={`Câu ${i + 1} đáp án ${o}`} />
                    ))}
                  </Row>
                ))}
              </Section>

              <Section title="Phần II · Đúng / Sai" note="tối đa 1đ/câu">
                {K.tf.map((row, i) => (
                  <div key={i} className="mb-3">
                    <div className="font-hand mb-1 flex justify-between text-[15px] font-bold">
                      Câu {i + 1}
                      {r && (
                        <span className="text-[12.5px] font-normal text-ink-soft">
                          {r.tfItems[i]}/4 ý · {fmt(TF_POINTS[r.tfItems[i]])}đ
                        </span>
                      )}
                    </div>
                    {row.map((key, j) => (
                      <Row key={j} label={`${'abcd'[j]})`} mark={r ? st.tf[i][j] === key : null}>
                        {['Đ', 'S'].map((o) => (
                          <Opt key={o} wide v={o} picked={st.tf[i][j] === o} keyV={key} done={!!r} onClick={() => pick('tf', i, j, o)} label={`Câu ${i + 1} ý ${'abcd'[j]} ${o === 'Đ' ? 'Đúng' : 'Sai'}`} />
                        ))}
                      </Row>
                    ))}
                  </div>
                ))}
              </Section>

              <Section title="Phần III · Trả lời ngắn" note="0,5đ/câu">
                {K.sa.map((key, i) => {
                  const ok = r ? shortAnswerOk(st.sa[i], key) : null
                  return (
                    <Row key={i} label={`${i + 1}.`} mark={ok}>
                      <input
                        inputMode="decimal"
                        value={st.sa[i] || ''}
                        disabled={!!r}
                        onChange={(e) => {
                          const v = e.target.value
                          setSt((s) => {
                            const sa = [...s.sa]
                            sa[i] = v
                            return { ...s, sa, started: true }
                          })
                        }}
                        placeholder="Kết quả"
                        aria-label={`Phần III câu ${i + 1}`}
                        className={`sketch-soft h-9 min-w-0 flex-1 px-2.5 tabular-nums outline-none focus:shadow-[0_0_0_3px_var(--hl-yellow)] ${
                          r ? (ok ? '!border-ok' : '!border-bad') : ''
                        }`}
                      />
                      {r && !ok && <span className="hl hl-green shrink-0 text-[13px] font-semibold">ĐA: {key}</span>}
                    </Row>
                  )
                })}
                <p className="mt-1 text-[12px] text-ink-soft">Số thập phân dùng dấu phẩy, ví dụ: -0,5</p>
              </Section>

              <p className="px-4 pb-1 text-[13px] text-ink-soft">Phần IV · Tự luận: làm ra giấy (tài liệu không có lời giải chi tiết).</p>

              <div className="flex gap-2 px-4 py-3">
                {r ? (
                  <button className="btn-sketch btn-primary flex-1" onClick={() => setSt(newState(K))}>
                    Làm lại đề này
                  </button>
                ) : (
                  <>
                    <button className="btn-sketch btn-primary flex-1" onClick={submit}>
                      Nộp bài
                    </button>
                    <button className="btn-sketch" onClick={() => window.confirm('Xoá toàn bộ câu trả lời của đề này?') && setSt(newState(K))}>
                      Xoá
                    </button>
                  </>
                )}
              </div>

              {history.length > 0 && (
                <ul className="px-4 pb-4 text-[12.5px] text-ink-soft">
                  {[...history].reverse().slice(0, 5).map((h) => (
                    <li key={h.at} className="tabular-nums">
                      {new Date(h.at).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })} — {fmt(h.total)}/{fmt(h.max)}đ · {formatTime(h.seconds)}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </aside>
      </div>

      {!open && (
        <button
          className="btn-sketch btn-primary fixed bottom-[84px] right-4 z-30 !rounded-full shadow-[3px_4px_0_var(--shadow)] lg:hidden"
          onClick={() => setOpen(true)}
        >
          ✎ Phiếu trả lời{K ? ` · ${answered}/${totalItems(K)}` : ''}
        </button>
      )}
    </div>
  )
}

function Section({ title, note, children }) {
  return (
    <div className="border-b-2 border-dashed border-line/30 px-4 py-3">
      <h3 className="mb-2 flex justify-between text-[12.5px] font-bold uppercase tracking-wide text-ink-soft">
        <span>{title}</span>
        <span className="font-semibold normal-case">{note}</span>
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function Row({ label, mark, children }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-hand w-7 shrink-0 text-[14px] font-bold text-ink-soft">{label}</span>
      {children}
      {mark != null && <span className={`font-hand ml-auto w-5 shrink-0 text-center font-bold ${mark ? 'text-ok' : 'text-bad'}`}>{mark ? '✓' : '✗'}</span>}
    </div>
  )
}

function Opt({ v, picked, keyV, done, onClick, label, wide }) {
  let cls = 'bg-card'
  if (picked) cls = 'bg-hl-yellow text-[#1d2026]'
  if (done) {
    if (v === keyV) cls = picked ? '!bg-ok !text-white dark:!text-[#1c2a23]' : '!border-ok text-ok'
    else if (picked) cls = '!bg-bad !text-white line-through dark:!text-[#1c2a23]'
    else cls = 'bg-card opacity-60'
  }
  return (
    <button
      onClick={onClick}
      disabled={done}
      aria-label={label}
      aria-pressed={picked}
      className={`font-hand h-8 ${wide ? 'w-11' : 'w-9'} rounded-md border-[1.5px] border-line text-[14px] font-bold transition-colors ${cls} ${done ? '' : 'hover:bg-[color-mix(in_srgb,var(--hl-yellow)_35%,var(--card))]'}`}
    >
      {v}
    </button>
  )
}
