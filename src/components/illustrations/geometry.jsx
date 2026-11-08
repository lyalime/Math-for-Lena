import { useState } from 'react'
import { ArrowHead, C, deg, Dot, Frame, Ln, num, Rough, Slider, Svg, T, Tabs } from './kit'

// Cung đánh dấu góc tại (cx, cy) từ góc a1 đến a2 (độ, chiều toán học, y hướng lên)
function AngleArc({ cx, cy, r = 22, a1, a2, color = C.ink, w = 2 }) {
  const p = (a) => [cx + r * Math.cos(deg(a)), cy - r * Math.sin(deg(a))]
  const [x1, y1] = p(a1)
  const [x2, y2] = p(a2)
  const large = Math.abs(a2 - a1) > 180 ? 1 : 0
  const sweep = a2 > a1 ? 0 : 1
  return <path d={`M${x1},${y1} A${r},${r} 0 ${large} ${sweep} ${x2},${y2}`} fill="none" strokeWidth={w} style={{ stroke: color }} />
}

function RightMark({ x, y, dx, dy, s = 11 }) {
  // góc vuông tại (x,y), hai cạnh theo hướng (dx,0) và (0,dy)
  return <path d={`M${x + s * dx},${y} L${x + s * dx},${y + s * dy} L${x},${y + s * dy}`} fill="none" strokeWidth={1.6} style={{ stroke: C.ink }} />
}

function Seg({ a, b, color, w = 7, label, lx = 0, ly = 0, size = 13 }) {
  return (
    <g>
      <Ln x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} color={color} w={w} hl />
      <Ln x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} w={2} />
      {label && (
        <T x={(a[0] + b[0]) / 2 + lx} y={(a[1] + b[1]) / 2 + ly} size={size} bold>
          {label}
        </T>
      )}
    </g>
  )
}

// ============ CHƯƠNG 4 ============

// c4t1 — tam giác vuông với góc α thay đổi
export function C4T1() {
  const [al, setAl] = useState(35)
  const L = 170
  const B = [36, 182]
  const A = [B[0] + L * Math.cos(deg(al)), B[1]]
  const Cc = [A[0], B[1] - L * Math.sin(deg(al))]
  const sin = Math.sin(deg(al))
  const cos = Math.cos(deg(al))
  const tan = Math.tan(deg(al))
  return (
    <Frame
      title="Đối – kề – huyền nhìn từ góc α"
      hint="Kéo góc α: cạnh đối dài ra thì sin tăng, cạnh kề ngắn lại thì cos giảm."
      controls={<Slider label="Góc α" value={al} min={10} max={80} step={1} onChange={setAl} display={`${al}°`} />}
      caption={`$\\sin ${al}^\\circ = \\dfrac{\\text{đối}}{\\text{huyền}} \\approx ${num(sin)}$, $\\ \\cos ${al}^\\circ = \\dfrac{\\text{kề}}{\\text{huyền}} \\approx ${num(cos)}$, $\\ \\tan ${al}^\\circ = \\dfrac{\\text{đối}}{\\text{kề}} \\approx ${num(tan)}$. Luôn có $\\sin^2\\alpha + \\cos^2\\alpha = 1$.`}
    >
      <Svg w={320} h={200} label="Tam giác vuông với góc alpha">
        <Rough>
          <Seg a={B} b={A} color={C.blue} label="kề" ly={14} />
          <Seg a={A} b={Cc} color={C.pink} label="đối" lx={18} />
          <Seg a={B} b={Cc} color={C.green} label="huyền" lx={-18} ly={-10} />
        </Rough>
        <RightMark x={A[0]} y={A[1]} dx={-1} dy={-1} />
        <AngleArc cx={B[0]} cy={B[1]} r={26} a1={0} a2={al} color={C.bad} w={2.5} />
        <T x={B[0] + 38 * Math.cos(deg(al / 2))} y={B[1] - 38 * Math.sin(deg(al / 2))} size={14} bold color={C.bad}>
          α
        </T>
        <T x={B[0] - 10} y={B[1] + 6} size={13} bold>B</T>
        <T x={A[0] + 10} y={A[1] + 6} size={13} bold>A</T>
        <T x={Cc[0] + 10} y={Cc[1] - 6} size={13} bold>C</T>
        <g>
          <T x={262} y={40} size={13} anchor="start" color={C.soft}>sin α</T>
          <T x={262} y={56} size={16} anchor="start" bold>{num(sin)}</T>
          <T x={262} y={82} size={13} anchor="start" color={C.soft}>cos α</T>
          <T x={262} y={98} size={16} anchor="start" bold>{num(cos)}</T>
          <T x={262} y={124} size={13} anchor="start" color={C.soft}>tan α</T>
          <T x={262} y={140} size={16} anchor="start" bold>{num(tan)}</T>
        </g>
      </Svg>
    </Frame>
  )
}

// c4t2 — chọn hệ thức để xem cạnh/góc liên quan
const REL = {
  bsinB: { label: 'b = a·sin B', seg: ['b', 'a'], ang: 'B', cap: 'Cạnh góc vuông $b$ = cạnh huyền $a$ × **sin** góc **đối** $B$.' },
  bcosC: { label: 'b = a·cos C', seg: ['b', 'a'], ang: 'C', cap: 'Cạnh góc vuông $b$ = cạnh huyền $a$ × **cos** góc **kề** $C$.' },
  btanB: { label: 'b = c·tan B', seg: ['b', 'c'], ang: 'B', cap: 'Cạnh góc vuông $b$ = cạnh góc vuông kia $c$ × **tan** góc **đối** $B$.' },
  csinC: { label: 'c = a·sin C', seg: ['c', 'a'], ang: 'C', cap: 'Cạnh góc vuông $c$ = cạnh huyền $a$ × **sin** góc **đối** $C$.' },
}
export function C4T2() {
  const [k, setK] = useState('bsinB')
  const r = REL[k]
  const A = [70, 172]
  const B = [270, 172]
  const Cc = [70, 46]
  const col = (n) => (r.seg[0] === n ? C.pink : r.seg[1] === n ? C.blue : 'transparent')
  return (
    <Frame title="Cạnh và góc trong tam giác vuông" hint="Chọn một hệ thức: cạnh cần tìm tô hồng, cạnh đã biết tô xanh, góc dùng được khoanh đỏ." caption={r.cap}>
      <Tabs options={Object.entries(REL).map(([key, v]) => [key, v.label])} value={k} onChange={setK} />
      <Svg w={320} h={200} label="Tam giác ABC vuông tại A">
        <Rough>
          <Seg a={A} b={Cc} color={col('b')} label="b" lx={-14} />
          <Seg a={A} b={B} color={col('c')} label="c" ly={14} />
          <Seg a={B} b={Cc} color={col('a')} label="a" lx={12} ly={-12} />
        </Rough>
        <RightMark x={A[0]} y={A[1]} dx={1} dy={-1} />
        {r.ang === 'B' ? (
          <AngleArc cx={B[0]} cy={B[1]} r={28} a1={180 - (Math.atan2(126, 200) * 180) / Math.PI} a2={180} color={C.bad} w={3} />
        ) : (
          <AngleArc cx={Cc[0]} cy={Cc[1]} r={26} a1={-90} a2={-90 + (Math.atan2(200, 126) * 180) / Math.PI} color={C.bad} w={3} />
        )}
        <T x={A[0] - 12} y={A[1] + 8} size={14} bold>A</T>
        <T x={B[0] + 12} y={B[1] + 8} size={14} bold>B</T>
        <T x={Cc[0] - 12} y={Cc[1] - 6} size={14} bold>C</T>
        <T x={250} y={40} size={18} bold color={C.ink}>{r.label}</T>
      </Svg>
    </Frame>
  )
}

// c4t3 — góc nâng và chiều cao tháp
export function C4T3() {
  const [al, setAl] = useState(35)
  const d = 20
  const dpx = 140
  const E = [56, 184]
  const base = [E[0] + dpx, 184]
  const hpx = dpx * Math.tan(deg(al))
  const top = [base[0], 184 - hpx]
  const h = d * Math.tan(deg(al))
  return (
    <Frame
      title="Góc nâng và chiều cao"
      hint="Người đứng cách tháp 20 m nhìn lên đỉnh tháp. Kéo góc nâng để xem chiều cao."
      controls={<Slider label="Góc nâng α" value={al} min={15} max={52} step={1} onChange={setAl} display={`${al}°`} />}
      caption={`$h = d \\cdot \\tan\\alpha = 20 \\cdot \\tan ${al}^\\circ \\approx ${num(h, 1)}$ m. Góc nâng đo từ **phương nằm ngang** lên tia nhìn.`}
    >
      <Svg w={320} h={200} label="Người quan sát nhìn lên đỉnh tháp">
        <Ln x1={10} y1={184} x2={310} y2={184} w={2} />
        {[20, 50, 80, 110, 140, 170, 200, 230, 260, 290].map((x) => (
          <Ln key={x} x1={x} y1={186} x2={x - 8} y2={196} color={C.soft} w={1} />
        ))}
        {/* người */}
        <Rough>
          <circle cx={E[0] - 14} cy={150} r={7} strokeWidth={2} style={{ fill: C.card, stroke: C.ink }} />
          <Ln x1={E[0] - 14} y1={157} x2={E[0] - 14} y2={172} />
          <Ln x1={E[0] - 14} y1={172} x2={E[0] - 21} y2={184} />
          <Ln x1={E[0] - 14} y1={172} x2={E[0] - 7} y2={184} />
          <Ln x1={E[0] - 22} y1={162} x2={E[0] - 6} y2={162} />
        </Rough>
        {/* tháp */}
        <Rough>
          <rect x={base[0]} y={top[1]} width={26} height={hpx} strokeWidth={2} style={{ fill: 'color-mix(in srgb, var(--hl-orange) 35%, transparent)', stroke: C.ink }} />
        </Rough>
        <Ln x1={E[0]} y1={E[1]} x2={top[0]} y2={top[1]} color={C.pink} w={2.5} dash="6 4" />
        <Ln x1={E[0]} y1={E[1]} x2={base[0]} y2={base[1]} color={C.blue} w={7} hl />
        <AngleArc cx={E[0]} cy={E[1]} r={30} a1={0} a2={al} color={C.bad} w={2.5} />
        <T x={E[0] + 44 * Math.cos(deg(al / 2))} y={E[1] - 44 * Math.sin(deg(al / 2))} size={14} bold color={C.bad}>
          α
        </T>
        <T x={(E[0] + base[0]) / 2} y={172} size={13} bold>d = 20 m</T>
        <Ln x1={base[0] + 36} y1={top[1]} x2={base[0] + 36} y2={184} color={C.green} w={6} hl />
        <T x={base[0] + 64} y={(top[1] + 184) / 2} size={13} bold>h ≈ {num(h, 1)} m</T>
      </Svg>
    </Frame>
  )
}

// ============ CHƯƠNG 5 ============

// c5t1 — điểm trong / trên / ngoài đường tròn
export function C5T1() {
  const [k, setK] = useState(0.6)
  const R = 70
  const O = [120, 104]
  const ang = deg(25)
  const M = [O[0] + R * k * Math.cos(ang), O[1] - R * k * Math.sin(ang)]
  const st = Math.abs(k - 1) < 0.001 ? 'on' : k < 1 ? 'in' : 'out'
  const txt = { in: ['nằm TRONG', 'OM < R', C.green], on: ['nằm TRÊN', 'OM = R', C.orange], out: ['nằm NGOÀI', 'OM > R', C.pink] }[st]
  return (
    <Frame
      title="Vị trí của điểm M với đường tròn (O; R)"
      hint="R = 3 cm. Kéo để thay đổi khoảng cách OM."
      controls={<Slider label="OM" value={k} min={0.2} max={1.8} step={0.1} onChange={setK} display={`${num(3 * k, 1)} cm`} />}
      caption={`$OM = ${num(3 * k, 1)}$ cm, $R = 3$ cm ⇒ $${st === 'in' ? 'OM < R' : st === 'on' ? 'OM = R' : 'OM > R'}$ ⇒ điểm $M$ **${txt[0].toLowerCase()}** đường tròn.`}
    >
      <Svg w={320} h={200} label="Đường tròn và điểm M">
        <circle cx={O[0]} cy={O[1]} r={R} style={{ fill: 'color-mix(in srgb, var(--hl-green) 18%, transparent)' }} />
        <Rough>
          <circle cx={O[0]} cy={O[1]} r={R} fill="none" strokeWidth={2.4} style={{ stroke: C.ink }} />
        </Rough>
        <Ln x1={O[0]} y1={O[1]} x2={O[0] - R} y2={O[1]} color={C.soft} w={1.5} dash="3 3" />
        <T x={O[0] - R / 2} y={O[1] + 12} size={12} color={C.soft}>R</T>
        <Ln x1={O[0]} y1={O[1]} x2={M[0]} y2={M[1]} color={txt[2]} w={6} hl />
        <Ln x1={O[0]} y1={O[1]} x2={M[0]} y2={M[1]} w={1.6} />
        <Dot x={O[0]} y={O[1]} r={3.5} />
        <T x={O[0] - 10} y={O[1] - 10} size={13} bold>O</T>
        <Dot x={M[0]} y={M[1]} r={6} color={txt[2]} />
        <T x={M[0] + 12} y={M[1] - 10} size={13} bold>M</T>
        <T x={262} y={80} size={18} bold color={txt[2] === C.pink ? C.bad : txt[2] === C.green ? C.ok : C.ink}>{txt[0]}</T>
        <T x={262} y={104} size={15} bold>{txt[1]}</T>
      </Svg>
    </Frame>
  )
}

// c5t2 — khoảng cách từ tâm đến dây
export function C5T2() {
  const [dk, setDk] = useState(0.5)
  const R = 80
  const O = [130, 100]
  const d = dk * R
  const half = Math.sqrt(R * R - d * d)
  const H = [O[0], O[1] + d]
  const A = [O[0] - half, H[1]]
  const Bp = [O[0] + half, H[1]]
  const dcm = 5 * dk
  const ab = 2 * Math.sqrt(25 - dcm * dcm)
  return (
    <Frame
      title="Khoảng cách từ tâm đến dây"
      hint="R = 5 cm. Kéo dây ra xa / lại gần tâm và để ý độ dài dây AB."
      controls={<Slider label="Khoảng cách d" value={dk} min={0} max={0.9} step={0.05} onChange={setDk} display={`${num(dcm, 2)} cm`} />}
      caption={`Tam giác $OHA$ vuông tại $H$: $AH = \\sqrt{R^2 - d^2}$ ⇒ $AB = 2\\sqrt{5^2 - ${num(dcm, 2)}^2} \\approx ${num(ab, 2)}$ cm. Dây **càng gần tâm càng dài**; $d = 0$ thì dây là đường kính.`}
    >
      <Svg w={320} h={200} label="Đường tròn với dây AB">
        <Rough>
          <circle cx={O[0]} cy={O[1]} r={R} fill="none" strokeWidth={2.4} style={{ stroke: C.ink }} />
        </Rough>
        <path d={`M${O[0]},${O[1]} L${A[0]},${A[1]} L${H[0]},${H[1]} Z`} style={{ fill: 'color-mix(in srgb, var(--hl-yellow) 45%, transparent)' }} />
        <Ln x1={A[0]} y1={A[1]} x2={Bp[0]} y2={Bp[1]} color={C.pink} w={7} hl />
        <Ln x1={A[0]} y1={A[1]} x2={Bp[0]} y2={Bp[1]} w={2} />
        <Ln x1={O[0]} y1={O[1]} x2={A[0]} y2={A[1]} color={C.blue} w={2.4} />
        {d > 4 && <Ln x1={O[0]} y1={O[1]} x2={H[0]} y2={H[1]} color={C.ink} w={1.8} dash="4 3" />}
        {d > 12 && <RightMark x={H[0]} y={H[1]} dx={-1} dy={-1} s={9} />}
        <Dot x={O[0]} y={O[1]} r={3.5} />
        <T x={O[0] + 10} y={O[1] - 10} size={13} bold>O</T>
        <T x={A[0] - 12} y={A[1] + 4} size={13} bold>A</T>
        <T x={Bp[0] + 12} y={Bp[1] + 4} size={13} bold>B</T>
        <T x={H[0] + 8} y={H[1] + 13} size={12} bold>H</T>
        <T x={(O[0] + A[0]) / 2 - 8} y={(O[1] + A[1]) / 2 - 8} size={12} bold color={C.ink}>R</T>
        {d > 12 && <T x={O[0] + 9} y={O[1] + d / 2} size={12} bold>d</T>}
        <T x={270} y={70} size={13} color={C.soft}>AB ≈</T>
        <T x={270} y={92} size={20} bold>{num(ab, 2)}</T>
        <T x={270} y={112} size={12} color={C.soft}>cm</T>
      </Svg>
    </Frame>
  )
}

// c5t3 — hình quạt: độ dài cung và diện tích
export function C5T3() {
  const [n, setN] = useState(90)
  const R = 78
  const O = [110, 104]
  const end = [O[0] + R * Math.cos(deg(n)), O[1] - R * Math.sin(deg(n))]
  const large = n > 180 ? 1 : 0
  const sector = n >= 360 ? null : `M${O[0]},${O[1]} L${O[0] + R},${O[1]} A${R},${R} 0 ${large} 0 ${end[0]},${end[1]} Z`
  const arc = n >= 360 ? null : `M${O[0] + R},${O[1]} A${R},${R} 0 ${large} 0 ${end[0]},${end[1]}`
  const l = (Math.PI * 3 * n) / 180
  const S = (Math.PI * 9 * n) / 360
  return (
    <Frame
      title="Hình quạt tròn"
      hint="R = 3 cm. Kéo số đo cung n° để xem độ dài cung và diện tích quạt thay đổi."
      controls={<Slider label="Số đo n" value={n} min={10} max={360} step={5} onChange={setN} display={`${n}°`} />}
      caption={`$\\ell = \\dfrac{\\pi R n}{180} = \\dfrac{\\pi \\cdot 3 \\cdot ${n}}{180} \\approx ${num(l)}$ cm; $\\ S = \\dfrac{\\pi R^2 n}{360} = \\dfrac{\\ell R}{2} \\approx ${num(S)}$ cm². Quạt chiếm $\\dfrac{${n}}{360}$ hình tròn.`}
    >
      <Svg w={320} h={200} label="Hình quạt tròn">
        <circle cx={O[0]} cy={O[1]} r={R} fill="none" strokeWidth={1.4} strokeDasharray="4 4" style={{ stroke: C.soft }} />
        {sector ? (
          <path d={sector} style={{ fill: 'color-mix(in srgb, var(--hl-pink) 40%, transparent)' }} />
        ) : (
          <circle cx={O[0]} cy={O[1]} r={R} style={{ fill: 'color-mix(in srgb, var(--hl-pink) 40%, transparent)' }} />
        )}
        <Rough>
          {arc ? (
            <path d={arc} fill="none" strokeWidth={7} strokeLinecap="round" style={{ stroke: C.orange, mixBlendMode: 'var(--hl-blend)' }} />
          ) : (
            <circle cx={O[0]} cy={O[1]} r={R} fill="none" strokeWidth={7} style={{ stroke: C.orange }} />
          )}
          <Ln x1={O[0]} y1={O[1]} x2={O[0] + R} y2={O[1]} w={2} />
          {n < 360 && <Ln x1={O[0]} y1={O[1]} x2={end[0]} y2={end[1]} w={2} />}
        </Rough>
        <Dot x={O[0]} y={O[1]} r={3.5} />
        <T x={O[0] + R / 2} y={O[1] + 12} size={12} bold>R = 3</T>
        <T x={O[0] + 24 * Math.cos(deg(n / 2))} y={O[1] - 24 * Math.sin(deg(n / 2))} size={12} bold color={C.bad}>{n}°</T>
        <T x={262} y={66} size={13} color={C.soft}>độ dài cung</T>
        <T x={262} y={86} size={17} bold>ℓ ≈ {num(l)}</T>
        <T x={262} y={118} size={13} color={C.soft}>diện tích quạt</T>
        <T x={262} y={138} size={17} bold>S ≈ {num(S)}</T>
      </Svg>
    </Frame>
  )
}

// c5t4 — đường thẳng và đường tròn
export function C5T4() {
  const [dk, setDk] = useState(0.6)
  const R = 66
  const O = [140, 82]
  const d = dk * R
  const y = O[1] + d
  const st = Math.abs(dk - 1) < 0.001 ? 'tx' : dk < 1 ? 'cat' : 'ko'
  const half = st === 'cat' ? Math.sqrt(R * R - d * d) : 0
  const info = {
    cat: ['CẮT NHAU', 'd < R · 2 điểm chung', C.green],
    tx: ['TIẾP XÚC', 'd = R · 1 điểm chung', C.orange],
    ko: ['KHÔNG GIAO', 'd > R · 0 điểm chung', C.pink],
  }[st]
  return (
    <Frame
      title="Vị trí của đường thẳng và đường tròn"
      hint="R = 3 cm. Kéo đường thẳng ra xa tâm."
      controls={<Slider label="Khoảng cách d" value={dk} min={0} max={1.6} step={0.1} onChange={setDk} display={`${num(3 * dk, 1)} cm`} />}
      caption={`$d = ${num(3 * dk, 1)}$ cm, $R = 3$ cm ⇒ **${info[0].toLowerCase()}**.${st === 'tx' ? ' Khi tiếp xúc, bán kính $OH$ **vuông góc** với tiếp tuyến tại tiếp điểm $H$.' : ''}`}
    >
      <Svg w={320} h={200} label="Đường thẳng và đường tròn">
        <Rough>
          <circle cx={O[0]} cy={O[1]} r={R} fill="none" strokeWidth={2.4} style={{ stroke: C.ink }} />
        </Rough>
        <Ln x1={14} y1={y} x2={306} y2={y} color={info[2]} w={7} hl />
        <Ln x1={14} y1={y} x2={306} y2={y} w={2} />
        <T x={300} y={y - 10} size={13} bold anchor="end">a</T>
        {d > 3 && <Ln x1={O[0]} y1={O[1]} x2={O[0]} y2={y} w={1.8} dash="4 3" />}
        {d > 12 && <RightMark x={O[0]} y={y} dx={1} dy={-1} s={8} />}
        {d > 12 && <T x={O[0] - 10} y={O[1] + d / 2} size={12} bold>d</T>}
        <Dot x={O[0]} y={O[1]} r={3.5} />
        <T x={O[0] + 10} y={O[1] - 10} size={13} bold>O</T>
        {st === 'cat' && (
          <>
            <Dot x={O[0] - half} y={y} r={5.5} color={C.ink} />
            <Dot x={O[0] + half} y={y} r={5.5} color={C.ink} />
          </>
        )}
        {st === 'tx' && <Dot x={O[0]} y={y} r={5.5} color={C.ink} />}
        <T x={60} y={20} size={16} bold>{info[0]}</T>
        <T x={60} y={38} size={12} color={C.soft}>{info[1]}</T>
      </Svg>
    </Frame>
  )
}

// c5t5 — vị trí tương đối hai đường tròn
export function C5T5() {
  const [d, setD] = useState(70)
  const R = 60
  const r = 35
  const O = [96, 100]
  const O2 = [O[0] + d, 100]
  let st
  if (d === 0) st = ['ĐỒNG TÂM', 'd = 0', '0 điểm chung']
  else if (d < R - r) st = ['ĐỰNG NHAU', 'd < R − r', '0 điểm chung']
  else if (d === R - r) st = ['TIẾP XÚC TRONG', 'd = R − r', '1 điểm chung']
  else if (d < R + r) st = ['CẮT NHAU', 'R − r < d < R + r', '2 điểm chung']
  else if (d === R + r) st = ['TIẾP XÚC NGOÀI', 'd = R + r', '1 điểm chung']
  else st = ['Ở NGOÀI NHAU', 'd > R + r', '0 điểm chung']
  const pts = []
  if (d > R - r && d < R + r) {
    const a = (d * d + R * R - r * r) / (2 * d)
    const h = Math.sqrt(R * R - a * a)
    pts.push([O[0] + a, 100 - h], [O[0] + a, 100 + h])
  } else if (d === R - r || d === R + r) pts.push([O[0] + R, 100])
  const cm = (v) => num(v / 10, 1)
  return (
    <Frame
      title="Vị trí tương đối của hai đường tròn"
      hint="R = 6 cm, r = 3,5 cm. Kéo để thay đổi khoảng cách hai tâm d = OO'."
      controls={<Slider label="d = OO'" value={d} min={0} max={140} step={5} onChange={setD} display={`${cm(d)} cm`} />}
      caption={`$d = ${cm(d)}$ cm; $R - r = 2{,}5$ cm, $R + r = 9{,}5$ cm ⇒ **${st[0].toLowerCase()}** ($${st[1].replace('−', '-')}$), ${st[2]}.`}
    >
      <Svg w={320} h={200} label="Hai đường tròn">
        <circle cx={O[0]} cy={O[1]} r={R} style={{ fill: 'color-mix(in srgb, var(--hl-blue) 22%, transparent)' }} />
        <circle cx={O2[0]} cy={O2[1]} r={r} style={{ fill: 'color-mix(in srgb, var(--hl-pink) 28%, transparent)' }} />
        <Rough>
          <circle cx={O[0]} cy={O[1]} r={R} fill="none" strokeWidth={2.3} style={{ stroke: C.ink }} />
          <circle cx={O2[0]} cy={O2[1]} r={r} fill="none" strokeWidth={2.3} style={{ stroke: C.ink }} />
        </Rough>
        {d > 0 && <Ln x1={O[0]} y1={100} x2={O2[0]} y2={100} w={1.6} dash="4 3" />}
        <Dot x={O[0]} y={100} r={3.5} />
        <T x={O[0] - 6} y={88} size={12} bold>O</T>
        <Dot x={O2[0]} y={100} r={3.5} />
        <T x={O2[0] + 8} y={88} size={12} bold>O'</T>
        {pts.map(([x, y], i) => (
          <Dot key={i} x={x} y={y} r={5.5} color={C.orange} />
        ))}
        <T x={300} y={22} size={15} bold anchor="end">{st[0]}</T>
        <T x={300} y={40} size={12} anchor="end" color={C.soft}>{st[2]}</T>
      </Svg>
    </Frame>
  )
}
