// Kiểm tra nhanh các file src/data/chuong-*.json: chạy `npm run check-data`
import { readFileSync, readdirSync } from 'node:fs'
import katex from 'katex'

const dir = new URL('../src/data/', import.meta.url)
const files = readdirSync(dir).filter((f) => /^chuong-\d+\.json$/.test(f))
const ids = new Set()
let errors = 0
const err = (f, msg) => {
  errors++
  console.error(`✗ ${f}: ${msg}`)
}

function checkTex(f, where, s) {
  if (typeof s !== 'string') return
  const re = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g
  let m
  while ((m = re.exec(s))) {
    try {
      katex.renderToString(m[1] ?? m[2], { throwOnError: true, strict: 'ignore' })
    } catch (e) {
      err(f, `${where}: công thức lỗi "${m[1] ?? m[2]}" → ${e.message.split('\n')[0]}`)
    }
  }
  if ((s.match(/\$/g) || []).length % 2) err(f, `${where}: số dấu $ bị lẻ`)
}

for (const f of files) {
  const c = JSON.parse(readFileSync(new URL(f, dir), 'utf8'))
  const topicIds = new Set(c.topics.map((t) => t.id))
  for (const t of c.topics) {
    ;[t.summary, ...(t.points || [])].forEach((s, i) => checkTex(f, `${t.id} lý thuyết #${i}`, s))
    for (const fm of t.formulas || []) {
      if (ids.has(fm.id)) err(f, `trùng id ${fm.id}`)
      ids.add(fm.id)
      checkTex(f, fm.id, fm.front)
      checkTex(f, fm.id, fm.back)
    }
    if (t.example) [t.example.problem, ...t.example.steps].forEach((s) => checkTex(f, `${t.id} ví dụ`, s))
  }
  for (const q of c.questions) {
    if (ids.has(q.id)) err(f, `trùng id ${q.id}`)
    ids.add(q.id)
    if (!topicIds.has(q.topic)) err(f, `${q.id}: topic "${q.topic}" không có trong chương`)
    if (!['de', 'tb', 'kho'].includes(q.difficulty)) err(f, `${q.id}: difficulty phải là de/tb/kho`)
    if (q.type === 'mcq' && (!Array.isArray(q.options) || q.options.length !== 4 || !(q.answer >= 0 && q.answer < 4)))
      err(f, `${q.id}: mcq cần 4 options và answer là số 0–3`)
    if (q.type === 'tf' && typeof q.answer !== 'boolean') err(f, `${q.id}: tf cần answer true/false`)
    if (q.type === 'number' && (q.answer == null || typeof q.answer === 'boolean')) err(f, `${q.id}: number cần answer là chuỗi số`)
    if (!['mcq', 'tf', 'number'].includes(q.type)) err(f, `${q.id}: type không hợp lệ`)
    if (!q.solution?.length) err(f, `${q.id}: thiếu lời giải`)
    ;[q.prompt, ...(q.options || []), ...(q.solution || [])].forEach((s) => checkTex(f, q.id, s))
  }
  console.log(`✓ ${f}: ${c.topics.length} chủ đề, ${c.questions.length} câu`)
}
if (errors) {
  console.error(`\n${errors} lỗi`)
  process.exit(1)
}
console.log('\nDữ liệu hợp lệ.')
