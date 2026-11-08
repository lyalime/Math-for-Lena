import { memo, useMemo } from 'react'
import katex from 'katex'

// Hiển thị chuỗi có công thức: $...$ (inline), $$...$$ (khối), **đậm**.
function renderTex(tex, displayMode) {
  try {
    return katex.renderToString(tex, { displayMode, throwOnError: false, strict: 'ignore' })
  } catch {
    return tex
  }
}

const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

export function toHtml(src = '') {
  const out = []
  const re = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g
  let last = 0
  let m
  while ((m = re.exec(src))) {
    out.push(textHtml(src.slice(last, m.index)))
    out.push(m[1] != null ? renderTex(m[1], true) : renderTex(m[2], false))
    last = re.lastIndex
  }
  out.push(textHtml(src.slice(last)))
  return out.join('')
}

function textHtml(s) {
  return escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

function MathText({ children, as: Tag = 'span', className = '' }) {
  const html = useMemo(() => toHtml(String(children ?? '')), [children])
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

export default memo(MathText)
