import { useEffect, useState } from 'react'
import { href } from '../lib/router'
import { streak, useProgress } from '../lib/progress'
import { save } from '../lib/storage'
import { MarginDoodles } from './Doodle'

const NAV = [
  { key: '', label: 'Bản đồ', icon: '🗺', path: '/' },
  { key: 'the-nho', label: 'Thẻ nhớ', icon: '🃏', path: '/the-nho' },
  { key: 'luyen-tap', label: 'Luyện tập', icon: '✏️', path: '/luyen-tap' },
  { key: 'de', label: 'Làm đề', icon: '📄', path: '/de' },
  { key: 'thi-thu', label: 'Thi thử', icon: '⏱', path: '/thi-thu' },
  { key: 'so-cau-sai', label: 'Sổ sai', icon: '📕', path: '/so-cau-sai' },
]

function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#1c2a23' : '#fbf8ef')
  }, [dark])
  const toggle = () =>
    setDark((d) => {
      save('theme', d ? 'light' : 'dark')
      return !d
    })
  return [dark, toggle]
}

export default function Layout({ route, children }) {
  const { p } = useProgress()
  const [dark, toggle] = useTheme()
  const current = route.parts[0] || ''
  const wrongCount = Object.keys(p.wrong).length
  const s = streak(p.days)

  const navActive = (k) => current === k || (k === '' && ['chuong', 'chu-de'].includes(current))

  return (
    <div className="min-h-dvh">
      <MarginDoodles />
      <header className="sticky top-0 z-30 border-b-2 border-dashed border-line/25 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 pl-12 pr-4 sm:pl-14">
          <a href="#/" className="font-hand chalk flex items-center gap-2 text-xl font-bold no-underline">
            <span className="hl">Sổ tay Toán 9</span>
          </a>
          <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Điều hướng chính">
            {NAV.map((n) => (
              <a
                key={n.key}
                href={href(n.path)}
                className={`font-hand rounded-md px-3 py-1 text-[15px] font-semibold no-underline ${navActive(n.key) ? 'hl hl-blue' : 'hover:underline'}`}
              >
                {n.label}
                {n.key === 'so-cau-sai' && wrongCount > 0 && <sup className="ml-0.5 text-bad">{wrongCount}</sup>}
              </a>
            ))}
          </nav>
          <div className="flex-1" />
          <a
            href="#/tien-do"
            className="font-hand flex items-center gap-1 rounded-full border-[1.5px] border-line px-2.5 py-0.5 text-sm font-bold no-underline"
            title="Chuỗi ngày học – xem tiến độ"
          >
            <span aria-hidden="true">🔥</span>
            {s}
            <span className="sr-only">ngày liên tiếp</span>
          </a>
          <button
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-line text-lg"
            aria-label={dark ? 'Chuyển sang giấy trắng' : 'Chuyển sang bảng đen'}
            title={dark ? 'Giấy trắng' : 'Bảng đen'}
          >
            {dark ? '☀︎' : '☾'}
          </button>
        </div>
      </header>

      <main className={`mx-auto pb-28 pl-12 pr-4 pt-5 sm:pl-14 md:pb-16 ${current === 'de' && route.parts[1] ? 'max-w-7xl' : 'max-w-5xl'}`}>{children}</main>

      <nav
        className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t-2 border-line bg-card md:hidden"
        aria-label="Điều hướng chính"
      >
        <ul className="mx-auto grid max-w-md grid-cols-6">
          {NAV.map((n) => (
            <li key={n.key}>
              <a
                href={href(n.path)}
                className="relative flex flex-col items-center gap-0.5 whitespace-nowrap pt-2 pb-1 text-[10.5px] font-semibold tracking-tight no-underline"
                aria-current={navActive(n.key) ? 'page' : undefined}
              >
                <span className={`text-xl leading-none ${navActive(n.key) ? 'scale-110' : 'opacity-70'}`} aria-hidden="true">
                  {n.icon}
                </span>
                <span className={navActive(n.key) ? 'hl' : 'text-ink-soft'}>{n.label}</span>
                {n.key === 'so-cau-sai' && wrongCount > 0 && (
                  <span className="absolute right-1.5 top-1 rounded-full bg-bad px-1.5 text-[10px] leading-4 text-white dark:text-[#1c2a23]">
                    {wrongCount}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export function PageTitle({ kicker, children, sub }) {
  return (
    <div className="mb-5">
      {kicker && <div className="font-hand text-[15px] font-semibold text-ink-soft">{kicker}</div>}
      <h1 className="font-hand chalk text-[28px] font-bold leading-tight sm:text-[34px]">{children}</h1>
      {sub && <p className="mt-1 text-ink-soft">{sub}</p>}
    </div>
  )
}

export function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`font-hand rounded-full border-[1.5px] border-line px-3.5 py-1 text-[15px] font-semibold transition-colors ${
        active ? 'bg-hl-yellow text-[#1d2026] shadow-[2px_2px_0_var(--shadow)]' : 'bg-card hover:bg-[color-mix(in_srgb,var(--hl-yellow)_25%,var(--card))]'
      }`}
      aria-pressed={active}
    >
      {children}
    </button>
  )
}
