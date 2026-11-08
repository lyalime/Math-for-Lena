import { getChapter, getTopic } from '../data'
import { href } from '../lib/router'
import { topicMastery, useProgress } from '../lib/progress'
import { PageTitle } from '../components/Layout'
import MathText from '../components/MathText'
import SolutionSteps from '../components/SolutionSteps'
import { AiBadge } from '../components/Badges'
import HighlightBar from '../components/HighlightBar'
import { NotFound } from './ChapterPage'
import { illustrations } from '../components/illustrations'

const HL = ['yellow', 'pink', 'green', 'blue', 'orange', 'yellow']

export default function TopicPage({ id }) {
  const t = getTopic(id)
  const { p } = useProgress()
  if (!t) return <NotFound />
  const c = getChapter(t.chapter)
  const nq = c.questions.filter((q) => q.topic === t.id).length
  const m = topicMastery(p, c, t)
  const Illustration = illustrations[t.id]

  return (
    <div>
      <a href={href(`/chuong/${c.id}`)} className="font-hand text-[15px] text-ink-soft no-underline hover:underline">
        ← Chương {c.id}
      </a>
      <div className="mt-2">
        <PageTitle kicker={`Chương ${c.id} · Thẻ lý thuyết`}>{t.title}</PageTitle>
      </div>

      {!t.points?.length ? (
        <p className="sketch-soft p-4 text-ink-soft">Chủ đề này chưa có nội dung.</p>
      ) : (
        <div className="space-y-6">
          {/* Tóm tắt */}
          <section className="sketch relative p-5 sm:p-6">
            <span className="tape -top-3 left-8" />
            <div className="mb-2 flex items-center gap-2">
              <h2 className="font-hand text-lg font-bold">
                <span className="hl">Tóm tắt nhanh</span>
              </h2>
              {t.aiGenerated && <AiBadge />}
            </div>
            <MathText as="p" className="text-[16.5px] font-medium">
              {t.summary}
            </MathText>
            <ul className="mt-4 space-y-2.5">
              {t.points.map((pt, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="font-hand mt-0.5 text-ink-soft" aria-hidden="true">
                    ✦
                  </span>
                  <MathText as="div" className="math-scroll min-w-0 flex-1">
                    {pt}
                  </MathText>
                </li>
              ))}
            </ul>
          </section>

          {/* Minh hoạ trực quan */}
          {Illustration && <Illustration />}

          {/* Công thức nổi bật */}
          <section>
            <h2 className="font-hand mb-3 text-lg font-bold">Công thức cần nhớ</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {t.formulas.map((f, i) => (
                <div key={f.id} className="sketch-soft relative p-3.5" style={{ transform: `rotate(${i % 2 ? 0.5 : -0.5}deg)` }}>
                  <MathText as="div" className="font-hand text-[14px] font-semibold text-ink-soft">
                    {f.front}
                  </MathText>
                  <div className="mt-1">
                    <MathText as="div" className={`hl hl-${HL[i]} math-scroll inline text-[16px]`}>
                      {f.back}
                    </MathText>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Ví dụ */}
          {t.example && (
            <section className="sketch p-5 sm:p-6">
              <h2 className="font-hand mb-2 text-lg font-bold">
                <span className="hl hl-blue">Ví dụ</span>
              </h2>
              <MathText as="div" className="math-scroll mb-4 text-[16.5px]">
                {t.example.problem}
              </MathText>
              <SolutionSteps steps={t.example.steps} title="Lời giải (mở từng bước)" />
              {t.example.source && <p className="mt-3 text-[12.5px] italic text-ink-soft">{t.example.source}</p>}
            </section>
          )}

          <section className="sketch-soft flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-[160px] flex-1">
              <div className="font-hand mb-1 text-sm font-semibold">Đã thuộc chủ đề: {Math.round(m * 100)}%</div>
              <HighlightBar value={m} color="green" />
            </div>
            <a className="btn-sketch" href={href('/the-nho', { c: c.id, t: t.id })}>
              🃏 Lật {t.formulas.length} thẻ
            </a>
            <a className="btn-sketch btn-primary" href={href('/luyen-tap', { c: c.id, t: t.id })}>
              ✏️ Làm {nq} câu
            </a>
          </section>
        </div>
      )}
    </div>
  )
}
