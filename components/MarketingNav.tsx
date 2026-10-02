'use client'

import { useEffect, useState } from 'react'

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`nav${scrolled ? ' is-scrolled' : ''}`}>
      <span className="nav__brand">Conduit</span>
      <div className="nav__links">
        <a className="nav__link" href="#how-it-works">How it works</a>
        <a className="nav__link" href="#features">Features</a>
        <a className="nav__link" href="https://github.com/gutivanian/MCP-Gateway" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </div>
      <div className="nav__actions">
        <a className="btn btn-outline" href="/login">Sign in</a>
        <a className="btn btn-primary" href="/register">Get started</a>
      </div>
    </nav>
  )
}
