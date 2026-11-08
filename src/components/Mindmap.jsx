import { motion } from 'framer-motion'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import MathText from './MathText'

/**
 * Sơ đồ tư duy vẽ tay.
 * root: { label, sub? }
 * branches: [{ key, label, href?, color, leaves: [string | { label, href? }] }]
 *
 * Bố cục tự đổi theo bề rộng khung:
 *  - "two"   (≥ 880px): nhánh toả hai bên gốc như mindmap thật
 *  - "one"   (≥ 600px): gốc bên trái, các nhánh toả sang phải
 *  - "stack" (< 600px): dạng cây dọc cho điện thoại
 * Đường nối là SVG được đo theo vị trí thật của các ô (nên ô chứa KaTeX dài ngắn tuỳ ý).
 */
export default function Mindmap({ root, branches }) {
  const wrap = useRef(null)
  const nodes = useRef({})
  const [mode, setMode] = useState('stack')
  const [paths, setPaths] = useState([])
  const [size, setSize] = useState({ w: 0, h: 0 })

  const reg = (k) => (el) => {
    if (el) nodes.current[k] = el
    else delete nodes.current[k]
  }

  const half = Math.ceil(branches.length / 2)
  const sideOf = (i) => (mode === 'two' && i < half ? 'left' : 'right')

  const measure = useCallback(() => {
    const box = wrap.current
    if (!box) return
    const W = box.clientWidth
    const nextMode = W >= 860 ? 'two' : W >= 560 ? 'one' : 'stack'
    if (nextMode !== mode) {
      setMode(nextMode)
      return
    }
    const b = box.getBoundingClientRect()
    const rect = (k) => {
      const el = nodes.current[k]
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { l: r.left - b.left, r: r.right - b.left, t: r.top - b.top, bt: r.bottom - b.top, cx: r.left - b.left + r.width / 2, cy: r.top - b.top + r.height / 2 }
    }
    const curve = (x1, y1, x2, y2) => {
      const dx = (x2 - x1) * 0.5
      return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`
    }
    const out = []
    const R = rect('root')
    if (!R) return
    branches.forEach((br, i) => {
      const B = rect(`b${i}`)
      if (!B) return
      if (mode === 'stack') {
        const tx = R.l + 22
        out.push({ d: `M${tx},${R.bt} V${B.cy - 12} Q${tx},${B.cy} ${tx + 12},${B.cy} H${B.l}`, color: br.color, w: 5, key: `e${i}` })
        return
      }
      const left = sideOf(i) === 'left'
      out.push({ d: left ? curve(R.l, R.cy, B.r, B.cy) : curve(R.r, R.cy, B.l, B.cy), color: br.color, w: 5, key: `e${i}` })
      br.leaves.forEach((_, j) => {
        const L = rect(`b${i}l${j}`)
        if (!L) return
        out.push({ d: left ? curve(B.l, B.cy, L.r, L.cy) : curve(B.r, B.cy, L.l, L.cy), color: br.color, w: 2.2, key: `e${i}-${j}`, leaf: true })
      })
    })
    setPaths(out)
    setSize({ w: box.clientWidth, h: box.clientHeight })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, branches])

  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(() => measure())
    if (wrap.current) ro.observe(wrap.current)
    document.fonts?.ready?.then(() => measure())
    const t = setTimeout(measure, 350)
    return () => {
      ro.disconnect()
      clearTimeout(t)
    }
  }, [measure])

  const Root = (
    <motion.div
      ref={reg('root')}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      className={`relative z-10 border-[2.5px] border-line bg-hl-yellow px-5 py-4 text-center text-[#1d2026] shadow-[3px_4px_0_var(--shadow)] ${
        mode === 'stack' ? 'w-full rounded-[22px_8px_20px_10px]' : 'w-[150px] shrink-0 rounded-[48%_52%_46%_54%/55%_45%_55%_45%]'
      }`}
    >
      <div className="font-hand text-[19px] font-bold leading-tight">{root.label}</div>
      {root.sub && <div className="mt-0.5 text-[12px] font-medium opacity-75">{root.sub}</div>}
    </motion.div>
  )

  // Hàm render (không phải component) để các ô không bị gắn lại mỗi lần đo đường nối
  const renderBranch = (br, i) => {
    const side = sideOf(i)
    const node = (
      <motion.a
        ref={reg(`b${i}`)}
        href={br.href}
        initial={{ opacity: 0, x: side === 'left' ? 16 : -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.08 * i + 0.15 }}
        className={`sketch-soft relative z-10 block shrink-0 px-3 py-2 no-underline shadow-[2px_3px_0_var(--shadow)] transition-transform hover:-rotate-1 ${
          mode === 'stack' ? 'w-fit max-w-full' : 'w-[148px]'
        }`}
        style={{ background: `color-mix(in srgb, var(--hl-${br.color}) 42%, var(--card))` }}
      >
        <span className="font-hand chalk block text-[15.5px] font-bold leading-snug">{br.label}</span>
        {br.href && <span className="text-[11px] text-ink-soft">mở →</span>}
      </motion.a>
    )
    if (mode === 'stack') {
      return (
        <div key={br.key} className="pl-11">
          {node}
          <ul className="mt-2 flex flex-wrap gap-1.5 border-l-2 border-dashed pl-3" style={{ borderColor: `var(--hl-${br.color})` }}>
            {br.leaves.map((lf, j) => (
              <Leaf key={j} lf={lf} color={br.color} />
            ))}
          </ul>
        </div>
      )
    }
    return (
      <div key={br.key} className={`flex items-center gap-6 ${side === 'left' ? 'flex-row-reverse' : ''}`}>
        {node}
        <ul className={`flex w-[172px] shrink-0 flex-col gap-2 ${side === 'left' ? 'items-end' : 'items-start'}`}>
          {br.leaves.map((lf, j) => (
            <Leaf key={j} lf={lf} color={br.color} refCb={reg(`b${i}l${j}`)} delay={0.08 * i + 0.3 + j * 0.04} />
          ))}
        </ul>
      </div>
    )
  }

  let body
  if (mode === 'two') {
    body = (
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-8">
        <div className="flex flex-col items-end gap-6">{branches.slice(0, half).map((br, i) => renderBranch(br, i))}</div>
        {Root}
        <div className="flex flex-col items-start gap-6">{branches.slice(half).map((br, k) => renderBranch(br, half + k))}</div>
      </div>
    )
  } else if (mode === 'one') {
    body = (
      <div className="flex items-center gap-10">
        {Root}
        <div className="flex flex-col gap-6">{branches.map((br, i) => renderBranch(br, i))}</div>
      </div>
    )
  } else {
    body = (
      <div className="flex flex-col gap-5">
        {Root}
        {branches.map((br, i) => renderBranch(br, i))}
      </div>
    )
  }

  return (
    <div ref={wrap} className="relative py-2">
      <svg className="pointer-events-none absolute inset-0 overflow-visible" width={size.w} height={size.h} aria-hidden="true">
        {paths.map((p) => (
          <motion.path
            key={p.key + mode}
            d={p.d}
            fill="none"
            strokeLinecap="round"
            style={{ stroke: `var(--hl-${p.color})`, mixBlendMode: 'var(--hl-blend)' }}
            strokeWidth={p.w}
            strokeDasharray={p.leaf ? '1 0' : undefined}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: p.leaf ? 0.9 : 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </svg>
      {body}
    </div>
  )
}

function Leaf({ lf, color, refCb, delay = 0 }) {
  const item = typeof lf === 'string' ? { label: lf } : lf
  const cls =
    'relative z-10 block w-max max-w-[172px] rounded-[14px_6px_13px_7px] border-[1.5px] border-dashed bg-card px-2.5 py-1 text-[13.5px] leading-snug no-underline'
  const style = { borderColor: `color-mix(in srgb, var(--hl-${color}) 75%, var(--line))` }
  return (
    <motion.li ref={refCb} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }} className="list-none">
      {item.href ? (
        <a href={item.href} className={`${cls} transition-transform hover:-translate-y-0.5 hover:underline`} style={style}>
          <MathText>{item.label}</MathText>
        </a>
      ) : (
        <span className={cls} style={style}>
          <MathText>{item.label}</MathText>
        </span>
      )}
    </motion.li>
  )
}
