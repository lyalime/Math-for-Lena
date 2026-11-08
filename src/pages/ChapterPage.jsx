import { getChapter } from '../data'
import { chapterMastery, topicMastery, useProgress } from '../lib/progress'
import { href } from '../lib/router'
import { PageTitle } from '../components/Layout'
import HighlightBar from '../components/HighlightBar'
import Doodle from '../components/Doodle'
import MathText from '../components/MathText'
import Mindmap from '../components/Mindmap'
import { Chip } from '../components/Layout'
import { load, save } from '../lib/storage'
import { useMemo, useState } from 'react'

const COLORS = ['yellow', 'pink', 'green', 'blue', 'orange']

export default function ChapterPage({ id }) {
  const c = getChapter(id)
  const { p } = useProgress()
  const [view, setView] = useState(() => load('chapterView', 'mindmap'))
  const branches = useMemo(
    () =>
      (c?.topics || []).map((t, i) => ({
        key: t.id,
        label: t.title,
        href: href(`/chu-de/${t.id}`),
        color: COLORS[i % COLORS.length],
        leaves: t.mindmap || [],
      })),
    [c],
  )
  if (!c) return <NotFound />
  const changeView = (v) => {
    setView(v)
    save('chapterView', v)
  }
  const ready = c.status === 'ready'
  const m = chapterMastery(p, c)

  return (
    <div>
      <a href="#/" className="font-hand text-[15px] text-ink-soft no-underline hover:underline">
        ← Bản đồ
      </a>
      <div className="mt-2 flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <PageTitle kicker={`Chương ${c.id}`}>{c.title}</PageTitle>
        </div>
        <Doodle name={c.doodle} className="hidden h-20 w-20 shrink-0 -rotate-6 text-ink opacity-70 sm:block" />
      </div>

      {!ready ? (
        <div className="sketch relative p-5">
          <span className="tape -top-3 left-6" />
          <p className="font-hand text-lg font-bold">Chương này đang được soạn.</p>
          <p className="mt-1 text-ink-soft">
            Sau khi bạn duyệt xong Chương 1, nội dung các chương còn lại sẽ được thêm vào file <code>src/data/chuong-{c.id}.json</code>.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            {c.topics.map((t) => (
              <li key={t.id}>{t.title}</li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          <div className="sketch-soft mb-6 flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-[180px] flex-1">
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-hand font-semibold">Đã thuộc cả chương</span>
                <span className="font-hand font-bold">{Math.round(m * 100)}%</span>
              </div>
              <HighlightBar value={m} />
            </div>
            <a className="btn-sketch" href={href('/the-nho', { c: c.id })}>
              🃏 Thẻ nhớ
            </a>
            <a className="btn-sketch btn-primary" href={href('/luyen-tap', { c: c.id })}>
              ✏️ Luyện tập
            </a>
          </div>

          <div className="mb-4 flex gap-2" role="tablist" aria-label="Cách xem chương">
            <Chip active={view === 'mindmap'} onClick={() => changeView('mindmap')}>
              🧠 Sơ đồ tư duy
            </Chip>
            <Chip active={view === 'list'} onClick={() => changeView('list')}>
              📋 Danh sách chủ đề
            </Chip>
          </div>

          {view === 'mindmap' ? (
            <section className="sketch relative mb-4 overflow-hidden p-4 sm:p-6" aria-label="Sơ đồ tư duy">
              <span className="tape -top-3 left-10" />
              <Mindmap root={{ label: c.short, sub: `Chương ${c.id}` }} branches={branches} />
              <p className="mt-4 text-center text-[12.5px] text-ink-soft">Bấm vào một nhánh để mở thẻ lý thuyết và hình minh hoạ của chủ đề đó.</p>
            </section>
          ) : (
          <ol className="space-y-4">
            {c.topics.map((t, i) => {
              const tm = topicMastery(p, c, t)
              const nq = c.questions.filter((q) => q.topic === t.id).length
              return (
                <li key={t.id}>
                  <a href={href(`/chu-de/${t.id}`)} className="sketch block p-4 no-underline transition-transform hover:rotate-[0.4deg] sm:p-5">
                    <div className="flex items-start gap-3">
                      <span className="font-hand chalk flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-line text-lg font-bold">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-hand chalk text-lg font-bold leading-snug">{t.title}</div>
                        <MathText as="p" className="mt-1 text-[14.5px] text-ink-soft">
                          {t.summary}
                        </MathText>
                        <div className="mt-2 flex items-center gap-2 text-[13px] text-ink-soft">
                          <span>{(t.formulas || []).length} thẻ · {nq} câu</span>
                          <HighlightBar value={tm} className="max-w-[160px] flex-1" height={11} color="green" label={`Đã thuộc ${t.title}`} />
                          <span className="font-hand font-bold text-ink">{Math.round(tm * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </a>
                </li>
              )
            })}
          </ol>
          )}
        </>
      )}
    </div>
  )
}

export function NotFound() {
  return (
    <div className="sketch p-6 text-center">
      <p className="font-hand text-xl font-bold">Trang này bị xé mất rồi 📄</p>
      <a className="btn-sketch mt-4" href="#/">
        Về bản đồ
      </a>
    </div>
  )
}
