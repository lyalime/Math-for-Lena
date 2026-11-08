import { useEffect, useState } from 'react'

// Router dạng hash (#/...) — chạy được khi deploy tĩnh lên Vercel mà không cần cấu hình rewrite.
function parse() {
  const raw = window.location.hash.replace(/^#/, '') || '/'
  const [path, qs = ''] = raw.split('?')
  const parts = path.split('/').filter(Boolean)
  return { path, parts, query: Object.fromEntries(new URLSearchParams(qs)) }
}

export function useRoute() {
  const [route, setRoute] = useState(parse)
  useEffect(() => {
    const on = () => {
      setRoute(parse())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export function href(path, query) {
  const qs = query ? new URLSearchParams(Object.entries(query).filter(([, v]) => v != null && v !== '')).toString() : ''
  return `#${path}${qs ? `?${qs}` : ''}`
}

export function go(path, query) {
  window.location.hash = href(path, query).slice(1)
}
