import { getQuestion, getTopic } from '../data'
import { useProgress, WRONG_EXIT_STREAK } from '../lib/progress'
import { href } from '../lib/router'
import { PageTitle } from '../components/Layout'
import MathText from '../components/MathText'
import { DiffBadge } from '../components/Badges'

export default function WrongBook() {
  const { p } = useProgress()
  const entries = Object.entries(p.wrong)
    .map(([id, w]) => ({ q: getQuestion(id), w }))
    .filter((e) => e.q)
  const groups = {}
  entries.forEach((e) => (groups[e.q.topic] ??= []).push(e))

  return (
    <div>
      <PageTitle kicker="Sổ câu sai" sub={`Câu làm sai được ghi vào đây. Làm đúng ${WRONG_EXIT_STREAK} lần liên tiếp thì câu đó rời sổ.`}>
        Sổ <span className="hl hl-pink">câu sai</span>
      </PageTitle>

      {entries.length === 0 ? (
        <div className="sketch relative p-6 text-center">
          <span className="tape -top-3 left-1/2 -ml-9" />
          <p className="font-hand text-xl font-bold">Sổ đang trống ✨</p>
          <p className="mt-1 text-ink-soft">Làm quiz đi, câu nào sai sẽ tự được ghi vào đây.</p>
          <a className="btn-sketch btn-primary mt-4" href="#/luyen-tap">
            Đi luyện tập
          </a>
        </div>
      ) : (
        <>
          <a className="btn-sketch btn-primary mb-6" href={href('/luyen-tap', { wrong: 1 })}>
            ✏️ Làm lại tất cả {entries.length} câu
          </a>
          <div className="space-y-6">
            {Object.entries(groups).map(([tid, list]) => (
              <section key={tid}>
                <h2 className="font-hand mb-2 text-lg font-bold">
                  {getTopic(tid)?.title} <span className="text-ink-soft">({list.length})</span>
                </h2>
                <ul className="space-y-3">
                  {list.map(({ q, w }) => (
                    <li key={q.id} className="sketch-soft p-3.5">
                      <div className="mb-1 flex items-center gap-3">
                        <DiffBadge d={q.difficulty} />
                        <span className="flex items-center gap-1 text-[12px] text-ink-soft" title="Số lần đúng liên tiếp">
                          {Array.from({ length: WRONG_EXIT_STREAK }, (_, i) => (
                            <span key={i} className={`inline-block h-3 w-3 rounded-full border-[1.5px] border-line ${i < w.streak ? 'bg-hl-green' : ''}`} />
                          ))}
                          <span className="ml-1">
                            {w.streak}/{WRONG_EXIT_STREAK} lần đúng
                          </span>
                        </span>
                      </div>
                      <MathText as="div" className="math-scroll line-clamp-3 text-[15px]">
                        {q.prompt}
                      </MathText>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
