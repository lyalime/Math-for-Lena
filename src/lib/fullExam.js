// Chấm đề full theo cấu trúc đề mới: Phần I 0,25đ/câu; Phần II theo số ý đúng; Phần III 0,5đ/câu.
export const TF_POINTS = [0, 0.1, 0.25, 0.5, 1]

const norm = (s) =>
  String(s ?? '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/−/g, '-')
    .replace(/\./g, ',')

export function shortAnswerOk(response, key) {
  const a = norm(response)
  const k = norm(key)
  if (!a) return false
  if (a === k) return true
  const na = Number(a.replace(',', '.'))
  const nk = Number(k.replace(',', '.'))
  return /^-?\d+(,\d+)?$/.test(a) && !Number.isNaN(nk) && Math.abs(na - nk) < 1e-9
}

export function emptyAnswers(key) {
  return {
    mcq: Array(key ? key.mcq.length : 12).fill(null),
    tf: (key ? key.tf : [0, 0]).map(() => [null, null, null, null]),
    sa: Array(key ? key.sa.length : 4).fill(''),
  }
}

export function countAnswered(a) {
  return a.mcq.filter(Boolean).length + a.tf.flat().filter(Boolean).length + a.sa.filter((s) => s && String(s).trim()).length
}

export function totalItems(key) {
  return key.mcq.length + key.tf.length * 4 + key.sa.length
}

export function gradeFull(key, a) {
  const mcqN = key.mcq.filter((v, i) => a.mcq[i] === v).length
  const tfItems = key.tf.map((row, i) => row.filter((v, j) => (a.tf[i] || [])[j] === v).length)
  const tfPts = tfItems.reduce((s, n) => s + TF_POINTS[n], 0)
  const saOk = key.sa.map((v, i) => shortAnswerOk(a.sa[i], v))
  const saN = saOk.filter(Boolean).length
  const total = mcqN * 0.25 + tfPts + saN * 0.5
  const max = key.mcq.length * 0.25 + key.tf.length + key.sa.length * 0.5
  return { mcqN, tfItems, tfPts, saOk, saN, total, max }
}

export const fmt = (n) => String(Math.round(n * 100) / 100).replace('.', ',')
