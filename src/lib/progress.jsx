import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { load, save, remove } from './storage'
import { chapters } from '../data'

const KEY = 'progress'
const empty = () => ({ v: 1, cards: {}, questions: {}, wrong: {}, days: [], exams: [], fullExams: {} })

export const todayKey = (d = new Date()) => {
  const z = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`
}

// Mức nhớ flashcard: 0 = chưa thuộc, 1 = mơ hồ, 2 = thuộc, 3 = thuộc vững (thuộc 2 lần liền)
export const CARD_WEIGHT = { new: 5, 0: 8, 1: 4, 2: 1.5, 3: 0.6 }
export const WRONG_EXIT_STREAK = 2

const Ctx = createContext(null)

export function ProgressProvider({ children }) {
  const [p, setP] = useState(() => ({ ...empty(), ...load(KEY, {}) }))
  useEffect(() => {
    save(KEY, p)
  }, [p])

  const markDay = (s) => {
    const t = todayKey()
    return s.days.includes(t) ? s.days : [...s.days, t].slice(-400)
  }

  const rateCard = useCallback((id, rating) => {
    setP((s) => {
      const cur = s.cards[id] || {}
      const level = rating === 'know' ? (cur.level >= 2 ? 3 : 2) : rating === 'vague' ? 1 : 0
      return {
        ...s,
        days: markDay(s),
        cards: { ...s.cards, [id]: { level, seen: (cur.seen || 0) + 1, at: Date.now() } },
      }
    })
  }, [])

  const recordAnswer = useCallback((qid, correct) => {
    setP((s) => {
      const cur = s.questions[qid] || { attempts: 0, correct: 0 }
      const wrong = { ...s.wrong }
      if (!correct) wrong[qid] = { streak: 0, at: Date.now() }
      else if (wrong[qid]) {
        const streak = wrong[qid].streak + 1
        if (streak >= WRONG_EXIT_STREAK) delete wrong[qid]
        else wrong[qid] = { ...wrong[qid], streak }
      }
      return {
        ...s,
        days: markDay(s),
        wrong,
        questions: {
          ...s.questions,
          [qid]: { attempts: cur.attempts + 1, correct: cur.correct + (correct ? 1 : 0), last: correct, at: Date.now() },
        },
      }
    })
  }, [])

  const recordExam = useCallback((exam) => {
    setP((s) => ({ ...s, exams: [...s.exams, { ...exam, at: Date.now() }].slice(-30) }))
  }, [])

  // Lượt nộp một đề full (bộ đề ôn theo chương): { total, max, seconds, parts }
  const recordFullExam = useCallback((id, result) => {
    setP((s) => {
      const list = [...((s.fullExams || {})[id] || []), { ...result, at: Date.now() }].slice(-20)
      return { ...s, days: markDay(s), fullExams: { ...(s.fullExams || {}), [id]: list } }
    })
  }, [])

  const reset = useCallback(() => {
    remove(KEY)
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('stt9:de:'))
        .forEach((k) => localStorage.removeItem(k))
    } catch {
      /* ignore */
    }
    setP(empty())
  }, [])

  const value = useMemo(
    () => ({ p, rateCard, recordAnswer, recordExam, recordFullExam, reset }),
    [p, rateCard, recordAnswer, recordExam, recordFullExam, reset],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useProgress = () => useContext(Ctx)

// ---- Các phép tính dẫn xuất ----
export const cardKnown = (p, id) => (p.cards[id]?.level ?? -1) >= 2
export const questionMastered = (p, id) => !!p.questions[id]?.last && !p.wrong[id]

export function mastery(p, { cards, questions }) {
  const total = cards.length + questions.length
  if (!total) return 0
  const done = cards.filter((c) => cardKnown(p, c.id)).length + questions.filter((q) => questionMastered(p, q.id)).length
  return done / total
}

export function chapterMastery(p, chapter) {
  return mastery(p, { cards: chapter.topics.flatMap((t) => t.formulas || []), questions: chapter.questions })
}

export function topicMastery(p, chapter, topic) {
  return mastery(p, { cards: topic.formulas || [], questions: chapter.questions.filter((q) => q.topic === topic.id) })
}

export function streak(days) {
  const set = new Set(days)
  const d = new Date()
  if (!set.has(todayKey(d))) d.setDate(d.getDate() - 1)
  let n = 0
  while (set.has(todayKey(d))) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}

export function overallMastery(p) {
  const ready = chapters.filter((c) => c.status === 'ready')
  return ready.length ? ready.reduce((s, c) => s + chapterMastery(p, c), 0) / ready.length : 0
}
