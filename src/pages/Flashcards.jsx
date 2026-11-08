import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import { allCards, chapters, getTopic, isReady } from '../data'
import { CARD_WEIGHT, useProgress } from '../lib/progress'
import { go } from '../lib/router'
import { Chip, PageTitle } from '../components/Layout'
import MathText from '../components/MathText'
import { AiBadge } from '../components/Badges'

// Spaced repetition đơn giản: thẻ "chưa thuộc" có trọng số cao nên quay lại nhiều hơn.
function pickNext(deck, cards, lastId) {
  const pool = deck.length > 1 ? deck.filter((c) => c.id !== lastId) : deck
  const weights = pool.map((c) => {
    const lv = cards[c.id]?.level
    return lv == null ? CARD_WEIGHT.new : CARD_WEIGHT[lv]
  })
  let r = Math.random() * weights.reduce((a, b) => a + b, 0)
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i]
    if (r <= 0) return pool[i]
  }
  return pool[pool.length - 1]
}

const RATINGS = [
  { key: 'dunno', label: 'Chưa thuộc', hint: 'gặp lại sớm', hl: 'pink' },
  { key: 'vague', label: 'Mơ hồ', hint: 'gặp lại', hl: 'orange' },
  { key: 'know', label: 'Thuộc', hint: 'ít gặp lại', hl: 'green' },
]

export default function Flashcards({ query }) {
  const { p, rateCard } = useProgress()
  const chapterId = query.c ? Number(query.c) : null
  const topicId = query.t || null
  const deck = useMemo(
    () => allCards.filter((c) => (topicId ? c.topic === topicId : chapterId ? c.chapter === chapterId : true)),
    [chapterId, topicId],
  )
  const [card, setCard] = useState(() => (deck.length ? pickNext(deck, p.cards, null) : null))
  const [flipped, setFlipped] = useState(false)
  const [count, setCount] = useState(0)
  const flipLock = useRef(false)

  const stats = useMemo(() => {
    const s = { know: 0, vague: 0, dunno: 0, fresh: 0 }
    deck.forEach((c) => {
      const lv = p.cards[c.id]?.level
      if (lv == null) s.fresh++
      else if (lv >= 2) s.know++
      else if (lv === 1) s.vague++
      else s.dunno++
    })
    return s
  }, [deck, p.cards])

  const rate = (r) => {
    rateCard(card.id, r)
    setCount((n) => n + 1)
    setFlipped(false)
    flipLock.current = true
    setTimeout(() => {
      setCard((cur) => pickNext(deck, { ...p.cards, [cur.id]: { level: r === 'know' ? 2 : r === 'vague' ? 1 : 0 } }, cur.id))
      flipLock.current = false
    }, 180)
  }

  const scopeChips = (
    <div className="no-scrollbar -mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1">
      <Chip active={!chapterId && !topicId} onClick={() => go('/the-nho')}>
        Tất cả
      </Chip>
      {chapters.filter(isReady).map((c) => (
        <Chip key={c.id} active={chapterId === c.id && !topicId} onClick={() => go('/the-nho', { c: c.id })}>
          Chương {c.id}
        </Chip>
      ))}
      {topicId && <Chip active>{getTopic(topicId)?.title}</Chip>}
    </div>
  )

  return (
    <div>
      <PageTitle kicker="Thẻ nhớ công thức" sub="Chạm vào thẻ để lật, rồi tự chấm xem mình nhớ đến đâu.">
        Lật thẻ <span className="hl hl-green">nhớ lâu</span>
      </PageTitle>
      {scopeChips}

      {!card ? (
        <p className="sketch-soft p-4 text-ink-soft">Chưa có thẻ nào trong phạm vi này.</p>
      ) : (
        <div className="mx-auto max-w-lg">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[13px]">
            <span className="font-hand text-[15px] font-semibold">Đã lật {count} thẻ</span>
            <span className="flex gap-3 text-ink-soft">
              <span>
                <b className="text-ok">{stats.know}</b> thuộc
              </span>
              <span>
                <b>{stats.vague}</b> mơ hồ
              </span>
              <span>
                <b className="text-bad">{stats.dunno}</b> chưa
              </span>
              <span>{stats.fresh} mới</span>
            </span>
          </div>

          <div className="relative h-[290px] sm:h-[320px]" style={{ perspective: 1200 }}>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={card.id + count}
                initial={{ x: 60, opacity: 0, rotate: 4 }}
                animate={{ x: 0, opacity: 1, rotate: 0 }}
                exit={{ x: -80, opacity: 0, rotate: -6 }}
                transition={{ duration: 0.28 }}
                className="absolute inset-0"
              >
                <motion.button
                  type="button"
                  onClick={() => !flipLock.current && setFlipped((f) => !f)}
                  className="relative h-full w-full text-left"
                  style={{ transformStyle: 'preserve-3d' }}
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  aria-label={flipped ? 'Mặt sau – chạm để lật lại' : 'Mặt trước – chạm để lật'}
                >
                  <Face>
                    <div className="font-hand text-[13px] font-semibold text-ink-soft">{getTopic(card.topic)?.title}</div>
                    <div className="flex flex-1 items-center justify-center px-2 text-center">
                      <MathText as="div" className="font-hand chalk math-scroll text-[22px] font-bold leading-snug">
                        {card.front}
                      </MathText>
                    </div>
                    <div className="font-hand text-center text-sm text-ink-soft">chạm để lật ↻</div>
                  </Face>
                  <Face back>
                    <div className="flex items-center justify-between">
                      <span className="font-hand text-[13px] font-semibold text-ink-soft">Đáp án</span>
                      <AiBadge />
                    </div>
                    <div className="flex flex-1 items-center justify-center px-2 text-center">
                      <MathText as="div" className="hl math-scroll text-[20px] leading-relaxed">
                        {card.back}
                      </MathText>
                    </div>
                    <MathText as="div" className="text-center text-[13px] text-ink-soft">
                      {card.front}
                    </MathText>
                  </Face>
                </motion.button>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2.5">
            {RATINGS.map((r) => (
              <button key={r.key} className="btn-sketch flex-col !gap-0 !px-2 !py-2" disabled={!flipped} onClick={() => rate(r.key)}>
                <span className={`hl hl-${r.hl} font-hand text-[16px] font-bold`}>{r.label}</span>
                <span className="text-[11px] font-normal text-ink-soft">{r.hint}</span>
              </button>
            ))}
          </div>
          {!flipped && <p className="mt-2 text-center text-[13px] text-ink-soft">Lật thẻ trước rồi mới chấm nhé.</p>}
        </div>
      )}
    </div>
  )
}

function Face({ children, back }) {
  return (
    <div
      className="sketch absolute inset-0 flex flex-col gap-2 p-5"
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: back ? 'rotateY(180deg)' : undefined,
        backgroundImage: 'repeating-linear-gradient(transparent 0 31px, color-mix(in srgb, var(--hl-blue) 35%, transparent) 31px 32px)',
      }}
    >
      {children}
    </div>
  )
}
