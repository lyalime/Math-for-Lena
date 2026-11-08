import { useState } from 'react'
import { Arrow, ArrowHead, Axes, C, Chain, Dot, Flow, Frame, Ln, makeScale, num, Rough, Slider, SplitTree, Svg, T, Tabs } from './kit'

// ============ CHƯƠNG 1 ============

// c1t1 — mỗi điểm trên đường thẳng là một nghiệm
export function C1T1() {
  const [x0, setX0] = useState(1)
  const W = 320
  const H = 220
  const s = makeScale({ xMin: -2, xMax: 4.5, yMin: -4.5, yMax: 3.5, w: W, h: H })
  const y0 = 2 * x0 - 3
  return (
    <Frame
      title="Tập nghiệm là một đường thẳng"
      hint="Kéo thanh trượt: điểm hồng luôn nằm trên đường thẳng, và toạ độ của nó luôn là một nghiệm."
      controls={<Slider label="x₀" value={x0} min={-0.5} max={3} step={0.5} onChange={setX0} display={num(x0)} />}
      caption={`Cặp số $(${num(x0)};\\ ${num(y0)})$: $2 \\cdot ${x0 < 0 ? `(${num(x0)})` : num(x0)} - ${y0 < 0 ? `(${num(y0)})` : num(y0)} = 3$ ✓ — là một nghiệm của $2x - y = 3$.`}
    >
      <Svg w={W} h={H} label="Đồ thị đường thẳng 2x - y = 3">
        <Axes s={s} />
        <Rough>
          <Ln x1={s.sx(-0.6)} y1={s.sy(-4.2)} x2={s.sx(3.25)} y2={s.sy(3.5)} color={C.blue} w={7} hl />
          <Ln x1={s.sx(-0.6)} y1={s.sy(-4.2)} x2={s.sx(3.25)} y2={s.sy(3.5)} w={2} />
        </Rough>
        <Dot x={s.sx(0)} y={s.sy(-3)} />
        <T x={s.sx(0) + 30} y={s.sy(-3) + 2} size={12}>(0; −3)</T>
        <Dot x={s.sx(1.5)} y={s.sy(0)} />
        <T x={s.sx(1.5) + 26} y={s.sy(0) + 12} size={12}>(1,5; 0)</T>
        <Ln x1={s.sx(x0)} y1={s.sy(0)} x2={s.sx(x0)} y2={s.sy(y0)} color={C.pink} w={1.5} dash="3 3" />
        <Ln x1={s.sx(0)} y1={s.sy(y0)} x2={s.sx(x0)} y2={s.sy(y0)} color={C.pink} w={1.5} dash="3 3" />
        <Dot x={s.sx(x0)} y={s.sy(y0)} r={6.5} color={C.pink} />
        <T x={s.sx(2.6)} y={s.sy(3.1)} size={14} bold>2x − y = 3</T>
      </Svg>
    </Frame>
  )
}

// c1t2 — ba vị trí của hai đường thẳng ↔ số nghiệm
const SYS = {
  cat: {
    eq: ['x − y = −1', 'x + y = 3'],
    lines: [
      [1, 1, -2, 4],
      [-1, 3, -2, 4],
    ],
    meet: [1, 2],
    cap: 'Hai đường thẳng **cắt nhau** tại $(1; 2)$ → hệ có **nghiệm duy nhất**. Dấu hiệu: $\\dfrac{a}{a\'} \\neq \\dfrac{b}{b\'}$.',
  },
  song: {
    eq: ['x − y = −1', 'x − y = 1'],
    lines: [
      [1, 1, -3, 4],
      [1, -1, -1, 4],
    ],
    cap: 'Hai đường thẳng **song song** → không có điểm chung → hệ **vô nghiệm**. Dấu hiệu: $\\dfrac{a}{a\'} = \\dfrac{b}{b\'} \\neq \\dfrac{c}{c\'}$.',
  },
  trung: {
    eq: ['x − y = −1', '2x − 2y = −2'],
    lines: [
      [1, 1, -3, 4],
      [1, 1, -3, 4],
    ],
    cap: 'Hai đường thẳng **trùng nhau** → mọi điểm đều chung → hệ có **vô số nghiệm**. Dấu hiệu: $\\dfrac{a}{a\'} = \\dfrac{b}{b\'} = \\dfrac{c}{c\'}$.',
  },
}
export function C1T2() {
  const [k, setK] = useState('cat')
  const W = 320
  const H = 220
  const s = makeScale({ xMin: -3, xMax: 4, yMin: -2, yMax: 5, w: W, h: H })
  const d = SYS[k]
  const colors = [C.blue, C.pink]
  return (
    <Frame title="Hệ phương trình = hai đường thẳng" hint="Chọn từng trường hợp để thấy số nghiệm của hệ chính là số giao điểm." caption={d.cap}>
      <Tabs
        options={[
          ['cat', 'Cắt nhau'],
          ['song', 'Song song'],
          ['trung', 'Trùng nhau'],
        ]}
        value={k}
        onChange={setK}
      />
      <Svg w={W} h={H} label="Hai đường thẳng trên mặt phẳng toạ độ">
        <Axes s={s} />
        <Rough>
          {d.lines.map(([m, b, xa, xb], i) => (
            <g key={i}>
              <Ln x1={s.sx(xa)} y1={s.sy(m * xa + b)} x2={s.sx(xb)} y2={s.sy(m * xb + b)} color={colors[i]} w={k === 'trung' && i === 1 ? 3 : 7} hl dash={k === 'trung' && i === 1 ? '8 7' : undefined} />
            </g>
          ))}
        </Rough>
        {d.meet && (
          <>
            <Dot x={s.sx(d.meet[0])} y={s.sy(d.meet[1])} r={6} color={C.ink} />
            <T x={s.sx(d.meet[0]) + 26} y={s.sy(d.meet[1]) - 4} size={13} bold>(1; 2)</T>
          </>
        )}
        <rect x={W - 118} y={6} width={112} height={42} rx={8} style={{ fill: C.card, stroke: C.soft }} strokeDasharray="3 3" />
        <T x={W - 62} y={19} size={12} color={C.ink}>{d.eq[0]}</T>
        <T x={W - 62} y={36} size={12} color={C.ink}>{d.eq[1]}</T>
        <Ln x1={W - 114} y1={19} x2={W - 106} y2={19} color={C.blue} w={5} hl />
        <Ln x1={W - 114} y1={36} x2={W - 106} y2={36} color={C.pink} w={5} hl />
      </Svg>
    </Frame>
  )
}

// c1t3 — các bước + xuôi/ngược dòng
export function C1T3() {
  return (
    <Frame title="Ba bước lập hệ & xuôi/ngược dòng" caption="Xuôi dòng: nước **đẩy** ca nô → $v + v_n$. Ngược dòng: nước **cản** → $v - v_n$. Làm chung $x$ giờ xong việc → mỗi giờ làm $\frac{1}{x}$ công việc.">
      <Flow
        steps={[
          { icon: '🎯', title: 'Chọn ẩn', text: 'Đặt $x, y$ + điều kiện' },
          { icon: '🧩', title: 'Lập hệ', text: 'Dịch đề thành 2 phương trình' },
          { icon: '🧮', title: 'Giải hệ', text: 'Thế hoặc cộng đại số' },
          { icon: '✅', title: 'Kết luận', text: 'Đối chiếu điều kiện' },
        ]}
      />
      <div className="mt-4">
        <Svg w={320} h={120} label="Ca nô xuôi dòng và ngược dòng">
          <rect x={6} y={28} width={308} height={70} rx={14} style={{ fill: 'color-mix(in srgb, var(--hl-blue) 30%, transparent)' }} />
          {[40, 120, 200, 280].map((x) => (
            <g key={x}>
              <Ln x1={x - 16} y1={64} x2={x + 10} y2={64} color={C.soft} w={1.5} />
              <ArrowHead x={x + 12} y={64} color={C.soft} size={6} />
            </g>
          ))}
          <T x={160} y={16} size={12} color={C.soft}>dòng nước chảy →</T>
          <Boat x={70} y={46} dir={1} />
          <Arrow x1={100} y1={46} x2={150} y2={46} color={C.green} />
          <T x={128} y={34} size={13} bold>v + vₙ</T>
          <Boat x={250} y={84} dir={-1} />
          <Arrow x1={222} y1={84} x2={180} y2={84} color={C.orange} />
          <T x={200} y={110} size={13} bold>v − vₙ</T>
        </Svg>
      </div>
    </Frame>
  )
}

function Boat({ x, y, dir }) {
  const f = dir
  return (
    <Rough>
      <path
        d={`M${x - 22 * f},${y - 6} L${x + 18 * f},${y - 6} L${x + 26 * f},${y - 12} L${x + 14 * f},${y + 6} L${x - 18 * f},${y + 6} Z`}
        strokeWidth={2}
        strokeLinejoin="round"
        style={{ fill: C.card, stroke: C.ink }}
      />
      <Ln x1={x} y1={y - 6} x2={x} y2={y - 22} />
      <path d={`M${x},${y - 22} L${x + 12 * f},${y - 12} L${x},${y - 10}`} strokeWidth={1.5} style={{ fill: C.yellow, stroke: C.ink }} />
    </Rough>
  )
}

// ============ CHƯƠNG 2 ============

// c2t1 — phương trình tích & chứa ẩn ở mẫu
export function C2T1() {
  const [k, setK] = useState('tich')
  return (
    <Frame
      title={k === 'tich' ? 'Phương trình tích tách làm hai' : '4 bước giải phương trình chứa ẩn ở mẫu'}
      caption={
        k === 'tich'
          ? 'Tích bằng $0$ khi **ít nhất một thừa số** bằng $0$: mỗi nhánh là một phương trình bậc nhất.'
          : 'Ví dụ $\\dfrac{2x}{x-1} = \\dfrac{2}{x-1}$: khử mẫu được $x = 1$, nhưng ĐKXĐ $x \\neq 1$ ⇒ loại ⇒ **vô nghiệm**.'
      }
    >
      <Tabs
        options={[
          ['tich', 'Phương trình tích'],
          ['mau', 'Chứa ẩn ở mẫu'],
        ]}
        value={k}
        onChange={setK}
      />
      {k === 'tich' ? (
        <SplitTree top="$(x - 4)(3x + 2) = 0$" left="$x - 4 = 0$" right="$3x + 2 = 0$" leftEnd="$x = 4$" rightEnd="$x = -\\dfrac{2}{3}$" />
      ) : (
        <Flow
          steps={[
            { icon: '🚧', title: 'Tìm ĐKXĐ', text: 'Mọi mẫu $\\neq 0$' },
            { icon: '🧹', title: 'Khử mẫu', text: 'Quy đồng, bỏ mẫu' },
            { icon: '🧮', title: 'Giải', text: 'PT bậc nhất / PT tích' },
            { icon: '🔍', title: 'Đối chiếu', text: 'Loại nghiệm sai ĐKXĐ' },
          ]}
        />
      )}
    </Frame>
  )
}

// c2t2 — nhân hai vế với số dương/âm
const CS = [-2, -1, -0.5, 0.5, 1, 2]
export function C2T2() {
  const [ci, setCi] = useState(4)
  const c = CS[ci]
  const a = 3
  const b = 1
  const W = 320
  const sx = (x) => 20 + ((x + 6) / 12) * (W - 40)
  const line = (y, label) => (
    <g>
      <Rough>
        <Ln x1={sx(-6)} y1={y} x2={sx(6)} y2={y} w={1.8} />
      </Rough>
      <ArrowHead x={sx(6) + 4} y={y} />
      {Array.from({ length: 13 }, (_, i) => i - 6).map((t) => (
        <g key={t}>
          <Ln x1={sx(t)} y1={y - 4} x2={sx(t)} y2={y + 4} w={t === 0 ? 2 : 1} color={t === 0 ? C.ink : C.soft} />
          {t % 2 === 0 && (
            <T x={sx(t)} y={y + 15} size={11} color={C.soft}>
              {t}
            </T>
          )}
        </g>
      ))}
      <T x={14} y={y - 14} size={12} anchor="start" color={C.soft}>
        {label}
      </T>
    </g>
  )
  const flip = c < 0
  return (
    <Frame
      title="Nhân hai vế với một số"
      hint="Cho a = 3 > b = 1. Kéo để đổi số nhân c và xem thứ tự của a·c, b·c."
      controls={<Slider label="Số nhân c" value={ci} min={0} max={CS.length - 1} step={1} onChange={setCi} display={num(c)} />}
      caption={
        flip
          ? `$c = ${num(c)} < 0$: $a \\cdot c = ${num(a * c)}$, $b \\cdot c = ${num(b * c)}$ ⇒ $ac < bc$ — nhân với số âm thì **đổi chiều**!`
          : `$c = ${num(c)} > 0$: $a \\cdot c = ${num(a * c)}$, $b \\cdot c = ${num(b * c)}$ ⇒ $ac > bc$ — nhân với số dương thì **giữ chiều**.`
      }
    >
      <Svg w={W} h={170} label="Hai trục số minh hoạ nhân bất đẳng thức">
        {line(50, 'trước khi nhân')}
        {line(130, `sau khi nhân với c = ${num(c)}`)}
        <Dot x={sx(a)} y={50} r={6} color={C.blue} />
        <T x={sx(a)} y={33} size={13} bold>a</T>
        <Dot x={sx(b)} y={50} r={6} color={C.blue} hollow />
        <T x={sx(b)} y={33} size={13} bold>b</T>
        <path d={`M${sx(a)},56 C${sx(a)},92 ${sx(a * c)},94 ${sx(a * c)},124`} fill="none" strokeWidth={1.5} strokeDasharray="4 4" style={{ stroke: C.soft }} />
        <path d={`M${sx(b)},56 C${sx(b)},92 ${sx(b * c)},94 ${sx(b * c)},124`} fill="none" strokeWidth={1.5} strokeDasharray="4 4" style={{ stroke: C.soft }} />
        <Dot x={sx(a * c)} y={130} r={6} color={flip ? C.pink : C.green} />
        <T x={sx(a * c)} y={113} size={13} bold>ac</T>
        <Dot x={sx(b * c)} y={130} r={6} color={flip ? C.pink : C.green} hollow />
        <T x={sx(b * c)} y={113} size={13} bold>bc</T>
        <T x={W - 26} y={86} size={22} bold color={flip ? C.bad : C.ok}>
          {flip ? '⇄' : '⇉'}
        </T>
      </Svg>
    </Frame>
  )
}

// c2t3 — biểu diễn tập nghiệm trên trục số
export function C2T3() {
  const [sg, setSg] = useState('>')
  const W = 320
  const sx = (x) => 20 + ((x + 4) / 10) * (W - 40)
  const right = sg === '>' || sg === '≥'
  const closed = sg === '≥' || sg === '≤'
  return (
    <Frame
      title="Tập nghiệm trên trục số"
      hint="Chọn dấu bất phương trình để xem phần được tô và đầu mút."
      caption={`Nghiệm $x ${sg === '≥' ? '\\ge' : sg === '≤' ? '\\le' : sg} 2$: ${closed ? '**lấy** cả số $2$ → chấm **đặc**' : '**không lấy** số $2$ → chấm **rỗng**'}; tô phần ${right ? 'bên phải' : 'bên trái'} số $2$.`}
    >
      <Tabs options={['>', '≥', '<', '≤'].map((x) => [x, `x ${x} 2`])} value={sg} onChange={setSg} />
      <Svg w={W} h={90} label="Trục số biểu diễn tập nghiệm">
        <Rough>
          <Ln x1={right ? sx(2) : sx(-4)} y1={44} x2={right ? sx(6) : sx(2)} y2={44} color={C.yellow} w={16} hl />
          <Ln x1={sx(-4)} y1={44} x2={sx(6)} y2={44} w={2} />
        </Rough>
        <ArrowHead x={sx(6) + 4} y={44} />
        {Array.from({ length: 11 }, (_, i) => i - 4).map((t) => (
          <g key={t}>
            <Ln x1={sx(t)} y1={39} x2={sx(t)} y2={49} w={1} color={C.soft} />
            <T x={sx(t)} y={66} size={12} color={t === 2 ? C.ink : C.soft} bold={t === 2}>
              {t}
            </T>
          </g>
        ))}
        <Dot x={sx(2)} y={44} r={7} hollow={!closed} color={C.pink} />
        <T x={right ? sx(4.2) : sx(-1.2)} y={22} size={14} bold>
          {right ? 'phần nghiệm →' : '← phần nghiệm'}
        </T>
      </Svg>
    </Frame>
  )
}

// ============ CHƯƠNG 3 ============

// c3t1 — căn bậc hai = cạnh hình vuông
export function C3T1() {
  const [a, setA] = useState(9)
  const side = Math.sqrt(a)
  const u = 26
  const px = side * u
  const x0 = 30
  const y0 = 165 - px
  const exact = Number.isInteger(side)
  return (
    <Frame
      title="Căn bậc hai là cạnh hình vuông"
      hint="Hình vuông có diện tích a thì cạnh của nó là √a."
      controls={<Slider label="Diện tích a" value={a} min={0} max={25} step={1} onChange={setA} />}
      caption={`$\\sqrt{${a}} = ${exact ? side : '\\approx ' + num(side)}$ vì ${exact ? `$${side}^2 = ${a}$` : `$${num(side)}^2 \\approx ${a}$`} và $\\sqrt{${a}} \\ge 0$. Số $${a}$ có hai căn bậc hai là $\\pm${exact ? side : '\\sqrt{' + a + '}'}$, còn căn bậc hai **số học** chỉ là $${exact ? side : '\\sqrt{' + a + '}'}$.`}
    >
      <Svg w={320} h={185} label="Hình vuông diện tích a">
        {px > 0 && (
          <>
            {Array.from({ length: Math.floor(side) }, (_, i) => i + 1).map((i) => (
              <g key={i}>
                <Ln x1={x0 + i * u} y1={y0} x2={x0 + i * u} y2={165} color={C.soft} w={0.7} dash="2 3" />
                <Ln x1={x0} y1={165 - i * u} x2={x0 + px} y2={165 - i * u} color={C.soft} w={0.7} dash="2 3" />
              </g>
            ))}
            <Rough>
              <rect x={x0} y={y0} width={px} height={px} strokeWidth={2.2} style={{ fill: 'color-mix(in srgb, var(--hl-green) 40%, transparent)', stroke: C.ink }} />
            </Rough>
            <T x={x0 + px / 2} y={y0 + px / 2} size={15} bold>
              S = {a}
            </T>
          </>
        )}
        <Ln x1={x0} y1={175} x2={x0 + Math.max(px, 1)} y2={175} color={C.pink} w={6} hl />
        <T x={x0 + px + 50} y={175} size={14} bold>
          cạnh = √{a} {exact ? `= ${side}` : `≈ ${num(side)}`}
        </T>
        <T x={250} y={40} size={13} color={C.soft}>
          a = 0 → cạnh 0
        </T>
        <T x={250} y={60} size={13} color={C.soft}>
          a &lt; 0 → không có
        </T>
        <T x={250} y={78} size={13} color={C.soft}>
          hình vuông nào!
        </T>
      </Svg>
    </Frame>
  )
}

// c3t2 — khai phương tích & bẫy tổng
export function C3T2() {
  const [k, setK] = useState('tich')
  return (
    <Frame
      title={k === 'tich' ? 'Căn của tích = tích các căn' : 'Bẫy: căn của tổng'}
      caption={
        k === 'tich'
          ? 'Tách số dưới căn thành tích các **số chính phương** để khai phương từng thừa số: $\\sqrt{AB} = \\sqrt{A} \\cdot \\sqrt{B}$.'
          : '**Không** có quy tắc khai phương một tổng: $\\sqrt{9 + 16} = 5$ nhưng $\\sqrt{9} + \\sqrt{16} = 7$.'
      }
    >
      <Tabs
        options={[
          ['tich', 'Khai phương tích'],
          ['bay', 'Bẫy thường gặp'],
        ]}
        value={k}
        onChange={setK}
      />
      {k === 'tich' ? (
        <SplitTree top="$\\sqrt{16 \\cdot 25}$" left="$\\sqrt{16}$" right="$\\sqrt{25}$" leftEnd="$4$" rightEnd="$5$" bottom="$4 \\cdot 5 = 20$" />
      ) : (
        <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <Chain steps={['$\\sqrt{9 + 16}$', '$\\sqrt{25}$', '$5$']} />
          <div className="font-hand text-center text-4xl font-bold text-bad" aria-label="khác">
            ≠
          </div>
          <Chain steps={['$\\sqrt{9} + \\sqrt{16}$', '$3 + 4$', '$7$']} />
        </div>
      )}
    </Frame>
  )
}

// c3t3 — đưa thừa số ra ngoài & trục căn
export function C3T3() {
  const [k, setK] = useState('ra')
  return (
    <Frame
      title={k === 'ra' ? 'Đưa thừa số ra ngoài dấu căn' : 'Trục căn thức ở mẫu'}
      caption={
        k === 'ra'
          ? 'Tìm **số chính phương lớn nhất** là ước của số dưới căn: $72 = 36 \\cdot 2$ ⇒ $\\sqrt{72} = 6\\sqrt{2}$.'
          : 'Mẫu có dạng $\\sqrt{A} - \\sqrt{B}$ thì nhân cả tử và mẫu với **liên hợp** $\\sqrt{A} + \\sqrt{B}$ để dùng $(a-b)(a+b) = a^2 - b^2$.'
      }
    >
      <Tabs
        options={[
          ['ra', 'Đưa ra ngoài'],
          ['truc', 'Trục căn'],
        ]}
        value={k}
        onChange={setK}
      />
      {k === 'ra' ? (
        <Chain steps={['$\\sqrt{72}$', '$\\sqrt{36 \\cdot 2}$', '$\\sqrt{36} \\cdot \\sqrt{2}$', '$6\\sqrt{2}$']} notes={['tách số chính phương', 'khai phương tích', '']} />
      ) : (
        <Chain
          steps={['$\\dfrac{2}{\\sqrt{3} - 1}$', '$\\dfrac{2(\\sqrt{3} + 1)}{(\\sqrt{3} - 1)(\\sqrt{3} + 1)}$', '$\\dfrac{2(\\sqrt{3} + 1)}{2}$', '$\\sqrt{3} + 1$']}
          notes={['nhân liên hợp $\\sqrt{3} + 1$', '$3 - 1 = 2$', 'rút gọn']}
        />
      )}
    </Frame>
  )
}

// c3t4 — căn bậc ba = cạnh hình lập phương
const CUBES = [-27, -8, -1, 1, 8, 27, 64, 125]
export function C3T4() {
  const [i, setI] = useState(5)
  const v = CUBES[i]
  const e = Math.cbrt(v)
  const s = Math.abs(e) * 22
  const x0 = 60
  const y0 = 170
  const dpt = s * 0.45
  const neg = v < 0
  return (
    <Frame
      title="Căn bậc ba là cạnh hình lập phương"
      hint="Khối lập phương có thể tích a thì cạnh của nó là ∛a. Số âm vẫn có căn bậc ba!"
      controls={<Slider label="Giá trị a" value={i} min={0} max={CUBES.length - 1} step={1} onChange={setI} display={v} />}
      caption={`$\\sqrt[3]{${v}} = ${e}$ vì $${e < 0 ? `(${e})` : e}^3 = ${v}$.${neg ? ' Căn bậc ba của số âm là số âm.' : ''}`}
    >
      <Svg w={320} h={190} label="Hình lập phương">
        <Rough>
          <g strokeWidth={2} strokeLinejoin="round" style={{ stroke: C.ink }} strokeDasharray={neg ? '6 4' : undefined}>
            <path d={`M${x0},${y0 - s} L${x0 + dpt},${y0 - s - dpt} L${x0 + s + dpt},${y0 - s - dpt} L${x0 + s},${y0 - s} Z`} style={{ fill: 'color-mix(in srgb, var(--hl-yellow) 55%, transparent)' }} />
            <path d={`M${x0 + s},${y0} L${x0 + s + dpt},${y0 - dpt} L${x0 + s + dpt},${y0 - s - dpt} L${x0 + s},${y0 - s} Z`} style={{ fill: 'color-mix(in srgb, var(--hl-orange) 50%, transparent)' }} />
            <rect x={x0} y={y0 - s} width={s} height={s} style={{ fill: 'color-mix(in srgb, var(--hl-pink) 40%, transparent)' }} />
          </g>
        </Rough>
        <Ln x1={x0} y1={y0 + 10} x2={x0 + s} y2={y0 + 10} color={C.blue} w={6} hl />
        <T x={x0 + s / 2} y={y0 + 10} size={12} bold>
          cạnh {e}
        </T>
        <T x={240} y={70} size={15} bold>
          V = {v}
        </T>
        <T x={240} y={95} size={15} bold>
          ∛({v}) = {e}
        </T>
        {neg && (
          <T x={240} y={120} size={12} color={C.soft}>
            (nét đứt: số âm)
          </T>
        )}
      </Svg>
    </Frame>
  )
}

// c3t5 — quy trình rút gọn
export function C3T5() {
  return (
    <Frame title="Quy trình rút gọn biểu thức chứa căn" caption="Nhận ra hằng đẳng thức theo $\\sqrt{x}$ là chìa khoá: $x - 1$, $x - 2\\sqrt{x} + 1$, $x\\sqrt{x} - 1$ đều phân tích được.">
      <Flow
        steps={[
          { icon: '🚧', title: 'ĐKXĐ', text: 'Dưới căn $\\ge 0$, mẫu $\\neq 0$' },
          { icon: '🧩', title: 'Phân tích', text: 'Theo $\\sqrt{x}$' },
          { icon: '➗', title: 'Quy đồng', text: 'Cộng trừ, rút gọn' },
          { icon: '🎯', title: 'Câu phụ', text: 'Thay số, tìm $x$, đối chiếu ĐK' },
        ]}
      />
      <div className="mt-4">
        <Chain steps={['$\\dfrac{x - 1}{\\sqrt{x} - 1}$', '$\\dfrac{(\\sqrt{x} - 1)(\\sqrt{x} + 1)}{\\sqrt{x} - 1}$', '$\\sqrt{x} + 1$']} notes={['$x - 1$ thành tích', 'giản ước']} />
      </div>
    </Frame>
  )
}
