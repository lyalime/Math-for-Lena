export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Chuẩn bị một câu để hiển thị: trộn thứ tự phương án trắc nghiệm.
export function present(q, { shuffleOptions = true } = {}) {
  if (q.type !== 'mcq') return { q, order: null }
  const idx = q.options.map((_, i) => i)
  return { q, order: shuffleOptions ? shuffle(idx) : idx }
}

function toNumber(s) {
  const t = String(s ?? '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/−/g, '-')
    .replace(',', '.')
  if (!t) return NaN
  const frac = t.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/)
  if (frac) return Number(frac[1]) / Number(frac[2])
  return /^-?\d*\.?\d+$/.test(t) ? Number(t) : NaN
}

// response: mcq → chỉ số phương án gốc; tf → true/false; number → chuỗi người dùng nhập
export function isCorrect(q, response) {
  if (response == null || response === '') return false
  if (q.type === 'mcq') return response === q.answer
  if (q.type === 'tf') return response === q.answer
  if (q.type === 'number') {
    const accepted = [q.answer, ...(q.accept || [])]
    const r = toNumber(response)
    return accepted.some((a) => {
      const n = toNumber(a)
      if (!Number.isNaN(n) && !Number.isNaN(r)) return Math.abs(n - r) < 1e-9
      return String(a).trim().toLowerCase() === String(response).trim().toLowerCase()
    })
  }
  return false
}

export function answerText(q) {
  if (q.type === 'mcq') return q.options[q.answer]
  if (q.type === 'tf') return q.answer ? 'Đúng' : 'Sai'
  return `$${String(q.answer).replace(/[.,]/, '{,}')}$`
}

export function formatTime(sec) {
  const s = Math.max(0, Math.round(sec))
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

// Tổng hợp kết quả một lượt làm bài: [{ q, response, correct }]
export function analyze(items, topicsById) {
  const total = items.length
  const right = items.filter((i) => i.correct).length
  const byTopic = {}
  for (const it of items) {
    const t = it.q.topic
    byTopic[t] ??= { topic: topicsById(t), right: 0, total: 0 }
    byTopic[t].total++
    if (it.correct) byTopic[t].right++
  }
  const topics = Object.values(byTopic).map((x) => ({ ...x, rate: x.right / x.total }))
  topics.sort((a, b) => a.rate - b.rate)
  return {
    total,
    right,
    score10: total ? Math.round((right / total) * 100) / 10 : 0,
    topics,
    weak: topics.filter((t) => t.rate < 0.7),
  }
}
