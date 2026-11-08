import { motion } from 'framer-motion'
import { chapters, allCards, allQuestions } from '../data'
import { chapterMastery, overallMastery, streak, useProgress, todayKey } from '../lib/progress'
import { href } from '../lib/router'
import Doodle from '../components/Doodle'
import HighlightBar from '../components/HighlightBar'
import Mindmap from '../components/Mindmap'
import { Chip } from '../components/Layout'
import { load, save } from '../lib/storage'
import { useState } from 'react'

const COLORS = ['yellow', 'pink', 'green', 'blue', 'orange']

// Sơ đồ tổng: gốc là môn học, nhánh là chương, lá là các chủ đề (bấm để mở)
const overviewBranches = chapters.map((c, i) => ({
  key: `c${c.id}`,
  label: `C${c.id}. ${c.short}`,
  href: href(`/chuong/${c.id}`),
  color: COLORS[i],
  leaves: c.topics.map((t) => ({ label: t.title, href: href(`/chu-de/${t.id}`) })),
}))

export default function Home() {
  const { p } = useProgress()
  const [view, setView] = useState(() => load('homeView', 'path'))
  const changeView = (v) => {
    setView(v)
    save('homeView', v)
  }
  const s = streak(p.days)
  const studiedToday = p.days.includes(todayKey())
  const wrong = Object.keys(p.wrong).length
  const overall = overallMastery(p)
  const readyQ = allQuestions.length
  const readyC = allCards.length

  return (
    <div>
      <section className="relative mb-8">
        <p className="font-hand text-ink-soft">Toán 9 · Học kì I</p>
        <h1 className="font-hand chalk text-[34px] font-bold leading-[1.15] sm:text-[44px]">
          Hôm nay ôn <span className="hl hl-pink">chương nào</span>?
        </h1>
        <p className="mt-2 max-w-xl text-ink-soft">
          Đi theo bản đồ: đọc thẻ lý thuyết, lật thẻ công thức, rồi làm quiz. Câu sai sẽ được ghi vào sổ để làm lại.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3 sm:max-w-xl">
          <Stat big={`${s}`} unit="ngày" label={studiedToday ? 'Chuỗi học 🔥' : 'Học hôm nay để giữ chuỗi'} />
          <Stat big={`${Math.round(overall * 100)}%`} label="Đã thuộc (chương đã mở)" />
          <a href="#/so-cau-sai" className="no-underline">
            <Stat big={`${wrong}`} unit="câu" label="Trong sổ câu sai" accent={wrong > 0} />
          </a>
        </div>
      </section>

      <a href="#/de" className="sketch relative mb-8 flex items-center gap-4 p-4 no-underline transition-transform hover:-rotate-[0.4deg] sm:max-w-xl">
        <span className="tape -top-3 right-8" />
        <span className="text-3xl" aria-hidden="true">
          📄
        </span>
        <span className="min-w-0 flex-1">
          <span className="font-hand chalk block text-lg font-bold">
            Làm <span className="hl hl-orange">full đề</span> theo chương
          </span>
          <span className="block text-[13.5px] text-ink-soft">34 đề gốc, có phiếu trả lời, bấm giờ và chấm điểm tự động</span>
        </span>
        <span className="font-hand text-xl" aria-hidden="true">
          →
        </span>
      </a>

      <section aria-labelledby="map-title" className="relative">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 id="map-title" className="font-hand mr-2 text-xl font-bold">
            Bản đồ 5 chương
          </h2>
          <Chip active={view === 'path'} onClick={() => changeView('path')}>
            🗺 Lộ trình
          </Chip>
          <Chip active={view === 'mindmap'} onClick={() => changeView('mindmap')}>
            🧠 Sơ đồ tổng
          </Chip>
        </div>
        {view === 'mindmap' ? (
          <div className="sketch relative overflow-hidden p-4 sm:p-6">
            <span className="tape -top-3 left-10" />
            <Mindmap root={{ label: 'Toán 9', sub: 'Học kì I' }} branches={overviewBranches} />
          </div>
        ) : (
        <div className="relative">
          {/* đường mòn nét đứt nối các chương */}
          <svg className="absolute left-[30px] top-6 h-[calc(100%-48px)] w-6 text-ink-soft sm:left-1/2 sm:-ml-3" preserveAspectRatio="none" viewBox="0 0 24 100" aria-hidden="true">
            <path d="M12 0 C2 15 22 25 12 40 C2 55 22 65 12 80 C6 90 14 95 12 100" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" opacity="0.55" />
          </svg>
          <ol className="relative space-y-6 sm:space-y-2">
            {chapters.map((c, i) => (
              <ChapterNode key={c.id} c={c} i={i} m={chapterMastery(p, c)} color={COLORS[i]} />
            ))}
          </ol>
        </div>
        )}
      </section>

      <p className="mt-10 text-center text-[13px] text-ink-soft">
        Đang có {readyQ} câu quiz và {readyC} thẻ công thức. Nội dung gắn nhãn <b>✎ AI tạo</b> cần được kiểm tra lại.
      </p>
    </div>
  )
}

function Stat({ big, unit, label, accent }) {
  return (
    <div className="sketch-soft h-full px-3 py-2.5">
      <div className="font-hand chalk text-2xl font-bold leading-tight">
        <span className={accent ? 'text-bad' : ''}>{big}</span>
        {unit && <span className="ml-1 text-sm text-ink-soft">{unit}</span>}
      </div>
      <div className="text-[12px] leading-snug text-ink-soft">{label}</div>
    </div>
  )
}

function ChapterNode({ c, i, m, color }) {
  const ready = c.status === 'ready'
  const right = i % 2 === 1
  return (
    <motion.li
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: i * 0.05 }}
      className={`relative flex items-center gap-4 sm:w-1/2 ${right ? 'sm:ml-auto sm:flex-row sm:pl-10' : 'sm:flex-row-reverse sm:pr-10 sm:text-right'}`}
    >
      <a
        href={href(`/chuong/${c.id}`)}
        className={`relative z-10 flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-full border-2 border-line bg-card no-underline shadow-[3px_3px_0_var(--shadow)] ${
          right ? 'sm:absolute sm:-left-[31px]' : 'sm:absolute sm:-right-[31px]'
        } ${ready ? '' : 'opacity-60'}`}
        style={{ background: ready ? `color-mix(in srgb, var(--hl-${color}) 45%, var(--card))` : undefined }}
        aria-label={`Chương ${c.id}`}
      >
        <Doodle name={c.doodle} className="h-10 w-10 text-ink" />
      </a>
      <a href={href(`/chuong/${c.id}`)} className={`sketch relative block flex-1 p-4 no-underline transition-transform hover:-rotate-[0.6deg] ${ready ? '' : 'opacity-75'}`}>
        {!ready && <span className="tape font-hand -top-3 right-6 flex items-center justify-center text-[12px] font-bold text-ink">sắp có</span>}
        <div className="font-hand text-[15px] font-semibold text-ink-soft">Chương {c.id}</div>
        <div className="font-hand chalk text-lg font-bold leading-snug">{c.title}</div>
        <div className="mt-1 text-[13px] text-ink-soft">
          {c.topics.length} chủ đề{ready ? ` · ${c.questions.length} câu quiz` : ''}
        </div>
        <div className={`mt-2 flex items-center gap-2 ${right ? '' : 'sm:flex-row-reverse'}`}>
          <HighlightBar value={m} color={color} className="flex-1" label={`Đã thuộc chương ${c.id}`} />
          <span className="font-hand w-11 shrink-0 text-sm font-bold">{Math.round(m * 100)}%</span>
        </div>
      </a>
    </motion.li>
  )
}
