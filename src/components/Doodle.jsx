// Họa tiết vẽ tay: đồ thị, căn, tam giác, đường tròn... dùng currentColor để đổi màu theo theme.
const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' }

const shapes = {
  lines: (
    <>
      <path d="M8 52 L56 50" {...common} strokeWidth={1.6} />
      <path d="M12 58 L13 8" {...common} strokeWidth={1.6} />
      <path d="M10 46 C22 38 34 28 54 14" {...common} />
      <path d="M10 18 C24 26 38 36 54 46" {...common} strokeDasharray="1 5" />
      <circle cx="32" cy="31" r="3.2" fill="currentColor" stroke="none" />
    </>
  ),
  balance: (
    <>
      <path d="M32 10 L32 54 M20 55 L45 54" {...common} />
      <path d="M10 22 L54 18" {...common} />
      <path d="M10 22 L4 38 Q11 44 18 38 Z M54 18 L47 34 Q54 40 61 34 Z" {...common} strokeWidth={1.8} />
      <text x="25" y="35" fontSize="13" fill="currentColor" fontFamily="Mali">&lt;</text>
    </>
  ),
  root: (
    <>
      <path d="M6 36 L13 33 L21 52 L31 12 L58 12" {...common} />
      <text x="35" y="38" fontSize="20" fill="currentColor" fontFamily="Mali">x</text>
    </>
  ),
  triangle: (
    <>
      <path d="M10 52 L54 53 L11 12 Z" {...common} />
      <path d="M11 44 L19 44 L19 52" {...common} strokeWidth={1.6} />
      <path d="M44 53 A 10 10 0 0 0 46 46" {...common} strokeWidth={1.6} />
      <text x="34" y="47" fontSize="11" fill="currentColor" fontFamily="Mali">α</text>
    </>
  ),
  circle: (
    <>
      <path d="M32 8 C48 7 57 19 56 32 C56 46 45 57 31 56 C17 56 8 45 8 31 C9 18 19 9 33 9" {...common} />
      <circle cx="32" cy="32" r="2.6" fill="currentColor" stroke="none" />
      <path d="M32 32 L52 20" {...common} strokeWidth={1.7} />
      <text x="40" y="34" fontSize="10" fill="currentColor" fontFamily="Mali">R</text>
    </>
  ),
}

export default function Doodle({ name, className = '' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {shapes[name] || shapes.lines}
    </svg>
  )
}

// Ký hiệu toán rải nền trang (rất mờ)
export function MarginDoodles() {
  const items = [
    { t: '∑', x: '6%', y: '14%', r: -12, s: 34 },
    { t: 'π', x: '92%', y: '22%', r: 10, s: 30 },
    { t: '√', x: '88%', y: '62%', r: -6, s: 36 },
    { t: '∞', x: '4%', y: '70%', r: 8, s: 30 },
    { t: 'Δ', x: '50%', y: '92%', r: -10, s: 26 },
    { t: 'sin α', x: '76%', y: '88%', r: 6, s: 18 },
  ]
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden md:block" aria-hidden="true">
      {items.map((i) => (
        <span
          key={i.t}
          className="font-hand absolute text-ink opacity-[0.07]"
          style={{ left: i.x, top: i.y, fontSize: i.s, transform: `rotate(${i.r}deg)` }}
        >
          {i.t}
        </span>
      ))}
      <svg className="absolute right-[3%] top-[36%] w-40 text-ink opacity-[0.07]" viewBox="0 0 120 90">
        <path d="M6 80 L114 79 M10 86 L11 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M14 12 C34 92 70 92 110 14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </div>
  )
}
