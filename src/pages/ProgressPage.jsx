import { chapters } from '../data'
import { chapterMastery, streak, todayKey, useProgress } from '../lib/progress'
import { formatTime } from '../lib/quiz'
import { PageTitle } from '../components/Layout'
import HighlightBar from '../components/HighlightBar'

const COLORS = ['yellow', 'pink', 'green', 'blue', 'orange']

export default function ProgressPage() {
  const { p, reset } = useProgress()
  const s = streak(p.days)
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (27 - i))
    return { key: todayKey(d), label: d.getDate() }
  })
  const daySet = new Set(p.days)
  const answered = Object.values(p.questions).reduce((a, q) => a + q.attempts, 0)

  return (
    <div>
      <PageTitle kicker="Tiến độ của bạn">
        Chuỗi <span className="hl hl-orange">{s} ngày</span> 🔥
      </PageTitle>

      <section className="sketch mb-6 p-5">
        <h2 className="font-hand mb-3 text-lg font-bold">28 ngày gần nhất</h2>
        <div className="grid grid-cols-7 gap-1.5 sm:max-w-sm">
          {days.map((d) => (
            <div
              key={d.key}
              className={`font-hand flex aspect-square items-center justify-center rounded-md border-[1.5px] text-[12px] font-bold ${
                daySet.has(d.key) ? 'border-line bg-hl-yellow text-[#1d2026]' : 'border-dashed border-ink-soft/50 text-ink-soft'
              } ${d.key === todayKey() ? 'ring-2 ring-bad/60' : ''}`}
              title={d.key}
            >
              {daySet.has(d.key) ? '✓' : d.label}
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-ink-soft">
          Đã trả lời {answered} lượt câu hỏi · {Object.keys(p.cards).length} thẻ đã lật · {p.exams.length} bài thi thử · {Object.values(p.fullExams || {}).reduce((s, l) => s + l.length, 0)} lượt nộp đề full
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-hand mb-3 text-lg font-bold">Mức thuộc từng chương</h2>
        <div className="sketch-soft space-y-3 p-4">
          {chapters.map((c, i) => (
            <div key={c.id}>
              <div className="mb-1 flex justify-between gap-2 text-[14.5px]">
                <span className="min-w-0 truncate">
                  {c.id}. {c.title}
                </span>
                <span className="font-hand font-bold">{c.status === 'ready' ? `${Math.round(chapterMastery(p, c) * 100)}%` : 'sắp có'}</span>
              </div>
              <HighlightBar value={chapterMastery(p, c)} color={COLORS[i]} height={12} />
            </div>
          ))}
        </div>
      </section>

      {p.exams.length > 0 && (
        <section className="mb-6">
          <h2 className="font-hand mb-3 text-lg font-bold">Lịch sử thi thử</h2>
          <ul className="sketch-soft divide-y divide-dashed divide-ink-soft/30 px-4">
            {[...p.exams].reverse().slice(0, 10).map((e) => (
              <li key={e.at} className="flex justify-between py-2 text-[14.5px]">
                <span>{new Date(e.at).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                <span>
                  <b>
                    {e.right}/{e.total}
                  </b>{' '}
                  · {formatTime(e.seconds)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="sketch-soft p-4">
        <h2 className="font-hand text-lg font-bold">Làm lại từ đầu</h2>
        <p className="mt-1 text-sm text-ink-soft">Xoá toàn bộ tiến độ, thẻ nhớ, sổ câu sai và chuỗi ngày học trên trình duyệt này.</p>
        <button
          className="btn-sketch mt-3 !border-bad text-bad"
          onClick={() => window.confirm('Xoá toàn bộ tiến độ? Không thể hoàn tác.') && reset()}
        >
          Reset tiến độ
        </button>
      </section>
    </div>
  )
}
