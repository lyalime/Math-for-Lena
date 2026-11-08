import { createContext, useContext, useId } from 'react'
import MathText from '../MathText'
import { Chip } from '../Layout'

// Bộ công cụ vẽ minh hoạ: SVG có bộ lọc "nét vẽ tay", chữ viết tay, thanh trượt, khung.

export const C = {
  ink: 'var(--ink)',
  soft: 'var(--ink-soft)',
  card: 'var(--card)',
  yellow: 'var(--hl-yellow)',
  pink: 'var(--hl-pink)',
  green: 'var(--hl-green)',
  blue: 'var(--hl-blue)',
  orange: 'var(--hl-orange)',
  ok: 'var(--ok)',
  bad: 'var(--bad)',
}

const RoughCtx = createContext('none')

export function Svg({ w = 320, h = 200, label, children, maxW }) {
  const id = 'rough' + useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} className="mx-auto block h-auto w-full select-none" style={{ maxWidth: maxW ?? w * 1.7 }}>
      <defs>
        <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <RoughCtx.Provider value={`url(#${id})`}>{children}</RoughCtx.Provider>
    </svg>
  )
}

// Nhóm nét vẽ có hiệu ứng run tay
export function Rough({ children }) {
  return <g filter={useContext(RoughCtx)}>{children}</g>
}

export function T({ x, y, children, size = 13, anchor = 'middle', color = C.ink, bold = false, hand = true }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      dominantBaseline="middle"
      fontSize={size}
      style={{ fill: color, fontFamily: hand ? 'var(--font-hand)' : 'var(--font-sans)', fontWeight: bold ? 700 : 600 }}
    >
      {children}
    </text>
  )
}

export function Ln({ x1, y1, x2, y2, color = C.ink, w = 2, dash, hl = false }) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      strokeWidth={w}
      strokeLinecap="round"
      strokeDasharray={dash}
      style={{ stroke: color, mixBlendMode: hl ? 'var(--hl-blend)' : undefined }}
    />
  )
}

export function Dot({ x, y, r = 4.5, color = C.ink, hollow = false }) {
  return <circle cx={x} cy={y} r={r} strokeWidth={2} style={{ fill: hollow ? C.card : color, stroke: color }} />
}

export function ArrowHead({ x, y, angle = 0, size = 8, color = C.ink }) {
  const a = (angle * Math.PI) / 180
  const p = (da) => `${x - size * Math.cos(a + da)},${y - size * Math.sin(a + da)}`
  return <polyline points={`${p(0.45)} ${x},${y} ${p(-0.45)}`} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ stroke: color }} />
}

export function Arrow({ x1, y1, x2, y2, color = C.ink, w = 3 }) {
  const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
  return (
    <g>
      <Ln x1={x1} y1={y1} x2={x2} y2={y2} color={color} w={w} />
      <ArrowHead x={x2} y={y2} angle={ang} color={color} size={9} />
    </g>
  )
}

// Hệ trục toạ độ đơn giản
export function makeScale({ xMin, xMax, yMin, yMax, w, h, pad = 18 }) {
  const sx = (x) => pad + ((x - xMin) / (xMax - xMin)) * (w - 2 * pad)
  const sy = (y) => h - pad - ((y - yMin) / (yMax - yMin)) * (h - 2 * pad)
  return { sx, sy, xMin, xMax, yMin, yMax }
}

export function Axes({ s, grid = true }) {
  const xs = []
  const ys = []
  for (let x = Math.ceil(s.xMin); x <= Math.floor(s.xMax); x++) xs.push(x)
  for (let y = Math.ceil(s.yMin); y <= Math.floor(s.yMax); y++) ys.push(y)
  return (
    <g>
      {grid &&
        xs.map((x) => <Ln key={'gx' + x} x1={s.sx(x)} y1={s.sy(s.yMin)} x2={s.sx(x)} y2={s.sy(s.yMax)} color={C.soft} w={0.6} dash="2 4" />)}
      {grid &&
        ys.map((y) => <Ln key={'gy' + y} x1={s.sx(s.xMin)} y1={s.sy(y)} x2={s.sx(s.xMax)} y2={s.sy(y)} color={C.soft} w={0.6} dash="2 4" />)}
      <Rough>
        <Ln x1={s.sx(s.xMin)} y1={s.sy(0)} x2={s.sx(s.xMax)} y2={s.sy(0)} w={1.8} />
        <Ln x1={s.sx(0)} y1={s.sy(s.yMin)} x2={s.sx(0)} y2={s.sy(s.yMax)} w={1.8} />
      </Rough>
      <ArrowHead x={s.sx(s.xMax)} y={s.sy(0)} angle={0} />
      <ArrowHead x={s.sx(0)} y={s.sy(s.yMax)} angle={-90} />
      <T x={s.sx(s.xMax) - 4} y={s.sy(0) + 12} size={13}>x</T>
      <T x={s.sx(0) + 10} y={s.sy(s.yMax) + 4} size={13}>y</T>
      <T x={s.sx(0) - 9} y={s.sy(0) + 11} size={12} color={C.soft}>O</T>
    </g>
  )
}

// Khung minh hoạ
export function Frame({ title, hint, children, controls, caption }) {
  return (
    <figure className="sketch relative m-0 p-4 sm:p-5">
      <span className="tape -top-3 right-10" />
      <figcaption className="mb-2">
        <span className="font-hand text-lg font-bold">
          <span className="hl hl-blue">Minh hoạ</span> · {title}
        </span>
        {hint && <span className="mt-0.5 block text-[12.5px] text-ink-soft">{hint}</span>}
      </figcaption>
      {children}
      {controls && <div className="mt-3 space-y-2">{controls}</div>}
      {caption && (
        <div className="sketch-soft math-scroll mt-3 px-3 py-2 text-[15px]" style={{ background: 'color-mix(in srgb, var(--hl-yellow) 18%, var(--card))' }}>
          <MathText as="div">{caption}</MathText>
        </div>
      )}
    </figure>
  )
}

export function Slider({ label, value, min, max, step = 1, onChange, display }) {
  return (
    <label className="flex items-center gap-3 text-[14px]">
      <span className="font-hand w-24 shrink-0 font-bold">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 min-w-0 flex-1 cursor-pointer"
        style={{ accentColor: 'var(--hl-pink)' }}
      />
      <span className="font-hand w-16 shrink-0 text-right font-bold tabular-nums">{display ?? value}</span>
    </label>
  )
}

export function Tabs({ options, value, onChange }) {
  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {options.map(([k, label]) => (
        <Chip key={k} active={value === k} onClick={() => onChange(k)}>
          {label}
        </Chip>
      ))}
    </div>
  )
}

// Sơ đồ các bước (dọc trên điện thoại, ngang trên màn rộng)
export function Flow({ steps }) {
  return (
    <ol className="m-0 flex list-none flex-col items-stretch gap-1 p-0 sm:flex-row">
      {steps.map((s, i) => (
        <li key={i} className="flex flex-col items-center gap-1 sm:flex-1 sm:flex-row">
          <div className="sketch-soft w-full flex-1 px-3 py-2 text-center" style={{ transform: `rotate(${i % 2 ? 0.8 : -0.8}deg)` }}>
            <div className="text-2xl leading-none" aria-hidden="true">
              {s.icon}
            </div>
            <div className="font-hand mt-1 text-[15px] font-bold leading-tight">{s.title}</div>
            {s.text && <MathText as="div" className="math-scroll mt-0.5 text-[13px] text-ink-soft">{s.text}</MathText>}
          </div>
          {i < steps.length - 1 && (
            <span className="font-hand shrink-0 rotate-90 text-2xl text-ink-soft sm:rotate-0" aria-hidden="true">
              ➜
            </span>
          )}
        </li>
      ))}
    </ol>
  )
}

// Chuỗi biến đổi: bước → bước → bước
export function Chain({ steps, notes = [] }) {
  return (
    <div className="flex flex-col items-center gap-1 sm:flex-row sm:flex-wrap sm:justify-center">
      {steps.map((s, i) => (
        <div key={i} className="flex flex-col items-center gap-1 sm:flex-row">
          <div className={`sketch-soft math-scroll px-3 py-2 text-[16px] ${i === steps.length - 1 ? 'bg-hl-yellow !text-[#1d2026]' : ''}`}>
            <MathText>{s}</MathText>
          </div>
          {i < steps.length - 1 && (
            <span className="flex flex-col items-center px-1 text-center">
              <span className="font-hand rotate-90 text-xl text-ink-soft sm:rotate-0" aria-hidden="true">
                ➜
              </span>
              {notes[i] && <MathText className="max-w-[120px] text-[11.5px] leading-tight text-ink-soft">{notes[i]}</MathText>}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

// Cây tách đôi: trên → (trái, phải) → dưới
export function SplitTree({ top, left, right, leftEnd, rightEnd, bottom, colors = ['pink', 'blue'] }) {
  const box = 'sketch-soft math-scroll px-3 py-1.5 text-center text-[15.5px]'
  return (
    <div className="mx-auto max-w-md">
      <div className="flex justify-center">
        <div className={`${box} bg-hl-yellow !text-[#1d2026]`}>
          <MathText>{top}</MathText>
        </div>
      </div>
      <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="block h-6 w-full" aria-hidden="true">
        <path d="M50 0 C50 12 25 10 25 24" fill="none" strokeWidth="2.5" vectorEffect="non-scaling-stroke" style={{ stroke: `var(--hl-${colors[0]})` }} />
        <path d="M50 0 C50 12 75 10 75 24" fill="none" strokeWidth="2.5" vectorEffect="non-scaling-stroke" style={{ stroke: `var(--hl-${colors[1]})` }} />
      </svg>
      <div className="grid grid-cols-2 gap-3">
        {[
          [left, leftEnd, colors[0]],
          [right, rightEnd, colors[1]],
        ].map(([a, b, col], i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className={box} style={{ background: `color-mix(in srgb, var(--hl-${col}) 30%, var(--card))` }}>
              <MathText>{a}</MathText>
            </div>
            {b && (
              <>
                <span className="font-hand text-ink-soft" aria-hidden="true">
                  ↓
                </span>
                <div className={`${box} font-semibold`}>
                  <MathText>{b}</MathText>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      {bottom && (
        <>
          <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="block h-5 w-full" aria-hidden="true">
            <path d="M25 0 C25 10 50 8 50 20 M75 0 C75 10 50 8 50 20" fill="none" strokeWidth="2.5" vectorEffect="non-scaling-stroke" style={{ stroke: 'var(--hl-green)' }} />
          </svg>
          <div className="flex justify-center">
            <div className={`${box} font-semibold`} style={{ background: 'color-mix(in srgb, var(--hl-green) 35%, var(--card))' }}>
              <MathText>{bottom}</MathText>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export const num = (x, d = 2) => {
  const r = Math.round(x * 10 ** d) / 10 ** d
  return String(r).replace('.', ',').replace(/^-0$/, '0')
}
export const deg = (a) => (a * Math.PI) / 180
