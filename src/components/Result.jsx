import { motion } from 'framer-motion'
import { useState } from 'react'
import { getTopic } from '../data'
import { analyze, formatTime, present } from '../lib/quiz'
import { href } from '../lib/router'
import HighlightBar from './HighlightBar'
import QuestionCard from './QuestionCard'
import { Confetti } from './Effects'

export default function Result({ items, seconds, title = 'Kết quả', onRetry, retryLabel = 'Làm lại' }) {
  const a = analyze(items, getTopic)
  const [showAll, setShowAll] = useState(false)
  const verdict = a.score10 >= 8 ? ['Xuất sắc!', 'green'] : a.score10 >= 6.5 ? ['Khá lắm!', 'blue'] : a.score10 >= 5 ? ['Tạm ổn', 'orange'] : ['Cần ôn thêm', 'pink']
  const wrongItems = items.filter((i) => !i.correct)
  const shown = showAll ? items : wrongItems

  return (
    <div className="relative">
      <Confetti fire={a.score10 >= 8 ? 1 : 0} />
      <div className="sketch relative mb-6 flex flex-wrap items-center gap-5 p-5 sm:p-6">
        <motion.div
          initial={{ scale: 0.6, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: -6, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 16 }}
          className="relative flex h-28 w-28 shrink-0 items-center justify-center"
        >
          <svg viewBox="0 0 100 100" className="absolute inset-0 text-bad" aria-hidden="true">
            <path d="M50 6 C78 5 95 24 94 50 C93 77 74 95 48 94 C22 93 5 74 6 48 C7 24 26 8 54 9" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
          <div className="font-hand text-center leading-none text-bad">
            <div className="text-[38px] font-bold">{String(a.score10).replace('.', ',')}</div>
            <div className="text-sm font-bold">/ 10</div>
          </div>
        </motion.div>
        <div className="min-w-[180px] flex-1">
          <div className="font-hand text-[15px] text-ink-soft">{title}</div>
          <div className="font-hand chalk text-[28px] font-bold leading-tight">
            <span className={`hl hl-${verdict[1]}`}>{verdict[0]}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[15px]">
            <span>
              Đúng <b>{a.right}</b>/{a.total} câu
            </span>
            {seconds != null && (
              <span>
                Thời gian <b className="tabular-nums">{formatTime(seconds)}</b>
              </span>
            )}
          </div>
        </div>
      </div>

      <section className="mb-6">
        <h2 className="font-hand mb-3 text-xl font-bold">Phân tích theo chủ đề</h2>
        <div className="sketch-soft space-y-3 p-4">
          {a.topics.map((t) => (
            <div key={t.topic?.id}>
              <div className="mb-1 flex justify-between gap-3 text-[14.5px]">
                <span className="min-w-0 truncate">{t.topic?.title}</span>
                <span className="font-hand shrink-0 font-bold">
                  {t.right}/{t.total}
                </span>
              </div>
              <HighlightBar value={t.rate} color={t.rate >= 0.8 ? 'green' : t.rate >= 0.5 ? 'yellow' : 'pink'} height={12} />
            </div>
          ))}
        </div>
        {a.weak.length > 0 ? (
          <div className="sketch relative mt-4 p-4">
            <span className="tape -top-3 right-8" />
            <p className="font-hand text-lg font-bold">Gợi ý ôn lại</p>
            <ul className="mt-2 space-y-2">
              {a.weak.map((t) => (
                <li key={t.topic.id} className="flex flex-wrap items-center gap-2">
                  <span className="hl hl-pink font-medium">{t.topic.title}</span>
                  <span className="text-[13px] text-ink-soft">đúng {Math.round(t.rate * 100)}%</span>
                  <span className="flex-1" />
                  <a className="btn-sketch !px-3 !py-1 text-sm" href={href(`/chu-de/${t.topic.id}`)}>
                    Đọc lý thuyết
                  </a>
                  <a className="btn-sketch btn-primary !px-3 !py-1 text-sm" href={href('/luyen-tap', { c: t.topic.chapter, t: t.topic.id })}>
                    Luyện lại
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-3 text-ink-soft">Không có chủ đề nào dưới 70% — tuyệt vời!</p>
        )}
      </section>

      <div className="mb-6 flex flex-wrap gap-3">
        {onRetry && (
          <button className="btn-sketch btn-primary" onClick={onRetry}>
            {retryLabel}
          </button>
        )}
        {wrongItems.length > 0 && (
          <a className="btn-sketch" href="#/so-cau-sai">
            📕 Mở sổ câu sai ({wrongItems.length})
          </a>
        )}
        <a className="btn-sketch" href="#/">
          Về bản đồ
        </a>
      </div>

      <section>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="font-hand text-xl font-bold">Xem lại {showAll ? 'tất cả' : 'câu sai'}</h2>
          <button className="text-sm text-ink-soft underline" onClick={() => setShowAll((s) => !s)}>
            {showAll ? 'Chỉ câu sai' : 'Hiện tất cả câu'}
          </button>
        </div>
        {shown.length === 0 ? (
          <p className="text-ink-soft">Không sai câu nào 🎉</p>
        ) : (
          <div className="space-y-5">
            {shown.map((it) => (
              <QuestionCard
                key={it.q.id}
                item={it.item || present(it.q, { shuffleOptions: false })}
                index={items.indexOf(it)}
                mode="review"
                response={it.response}
                revealed
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
