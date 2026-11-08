// Gom dữ liệu các chương. Muốn thêm chương/câu hỏi: sửa file chuong-N.json (xem README).
import c1 from './chuong-1.json'
import c2 from './chuong-2.json'
import c3 from './chuong-3.json'
import c4 from './chuong-4.json'
import c5 from './chuong-5.json'

export const chapters = [c1, c2, c3, c4, c5].map((c) => ({
  ...c,
  questions: c.questions.map((q) => ({ ...q, chapter: c.id })),
}))

export const allTopics = chapters.flatMap((c) => c.topics.map((t) => ({ ...t, chapter: c.id })))
export const allQuestions = chapters.flatMap((c) => c.questions)
export const allCards = chapters.flatMap((c) =>
  c.topics.flatMap((t) => (t.formulas || []).map((f) => ({ ...f, topic: t.id, chapter: c.id }))),
)

export const getChapter = (id) => chapters.find((c) => c.id === Number(id))
export const getTopic = (id) => allTopics.find((t) => t.id === id)
export const getQuestion = (id) => allQuestions.find((q) => q.id === id)
export const isReady = (c) => c.status === 'ready' && c.questions.length > 0

export const DIFFICULTY = {
  de: { label: 'Dễ', color: 'green' },
  tb: { label: 'Trung bình', color: 'blue' },
  kho: { label: 'Khó', color: 'pink' },
}
export const TYPE_LABEL = { mcq: 'Trắc nghiệm', number: 'Điền đáp số', tf: 'Đúng / Sai' }
