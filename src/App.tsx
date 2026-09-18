import React, { useState, useEffect, useRef, useCallback, CSSProperties } from 'react'

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function Reveal({ children, delay = 0, from = 'bottom', style }: {
  children: React.ReactNode
  delay?: number
  from?: 'bottom' | 'left' | 'right'
  style?: CSSProperties
}) {
  const { ref, visible } = useReveal()
  const translate = from === 'left' ? 'translateX(-32px)' : from === 'right' ? 'translateX(32px)' : 'translateY(28px)'
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translate(0)' : translate,
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  )
}

function CursorTrail() {
  const trailRef = useRef<{ x: number; y: number; id: number; el: HTMLDivElement }[]>([])
  const counterRef = useRef(0)

  const onMouseMove = useCallback((e: MouseEvent) => {
    const id = counterRef.current++
    const el = document.createElement('div')
    const size = Math.random() * 8 + 4
    el.style.cssText = `
      position: fixed;
      left: ${e.clientX - size / 2}px;
      top: ${e.clientY - size / 2}px;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: #f4b8cc;
      pointer-events: none;
      z-index: 99999;
      opacity: 0.85;
      transition: opacity 0.5s ease, transform 0.5s ease;
    `
    document.body.appendChild(el)
    trailRef.current.push({ x: e.clientX, y: e.clientY, id, el })

    requestAnimationFrame(() => {
      el.style.opacity = '0'
      el.style.transform = 'scale(0.2)'
    })

    setTimeout(() => {
      el.remove()
      trailRef.current = trailRef.current.filter(t => t.id !== id)
    }, 520)
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [onMouseMove])

  return null
}

const NAV_LINKS = ['Home', 'Projects', 'About', 'Contact']

function useTypewriter(text: string, speed = 45) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const tick = () => {
      i++
      setDisplayed(text.slice(0, i))
      if (i < text.length) setTimeout(tick, speed)
      else setDone(true)
    }
    const t = setTimeout(tick, 600)
    return () => clearTimeout(t)
  }, [text, speed])
  return { displayed, done }
}

function SparkleClick(): null { // sparkle burst on click
  const colors = ['#6b1230', '#f5c8d8', '#b5c97a', '#d94025', '#c06080', '#f4b8cc', '#ffffff']
  const onClick = useCallback((e: MouseEvent) => {
    const count = 14
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div')
      const size = Math.random() * 18 + 10
      const color = colors[Math.floor(Math.random() * colors.length)]
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6
      const dist = Math.random() * 80 + 35
      const dx = Math.cos(angle) * dist
      const dy = Math.sin(angle) * dist - 25
      el.style.cssText = `
        position:fixed;left:${e.clientX}px;top:${e.clientY}px;
        width:${size}px;height:${size}px;
        font-size:${size}px;line-height:1;color:${color};
        pointer-events:none;z-index:99998;opacity:1;
        transform:translate(-50%,-50%);
        transition:transform 0.65s cubic-bezier(.2,.8,.3,1),opacity 0.65s ease;
        user-select:none;
      `
      el.textContent = '✦'
      document.body.appendChild(el)
      requestAnimationFrame(() => {
        el.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${Math.random() * 0.4 + 0.1}) rotate(${Math.random()*180}deg)`
        el.style.opacity = '0'
      })
      setTimeout(() => el.remove(), 680)
    }
  }, [])
  useEffect(() => {
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [onClick])
  return null
}

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']

function EasterEgg(): React.ReactElement {
  const [open, setOpen] = useState(false)
  const logoClicks = useRef(0)
  const konamiProgress = useRef(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === KONAMI[konamiProgress.current]) {
        konamiProgress.current++
        if (konamiProgress.current === KONAMI.length) { setOpen(true); konamiProgress.current = 0 }
      } else { konamiProgress.current = 0 }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleLogoClick = useCallback(() => {
    logoClicks.current++
    if (logoClicks.current >= 5) { setOpen(true); logoClicks.current = 0 }
  }, [])

  // Expose logo click handler via custom event
  useEffect(() => {
    const handler = () => handleLogoClick()
    window.addEventListener('logo-click', handler)
    return () => window.removeEventListener('logo-click', handler)
  }, [handleLogoClick])

  if (!open) return <></>

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(107,18,48,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={() => setOpen(false)}
    >
      <style>{`
        @keyframes egg-pop { 0%{transform:scale(0.6);opacity:0} 70%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
        @keyframes egg-sparkle { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
      `}</style>
      <div style={{ backgroundColor: '#f8f6eb', borderRadius: '4px', padding: '56px 48px', maxWidth: '480px', textAlign: 'center', animation: 'egg-pop 0.45s cubic-bezier(0.22,1,0.36,1) both', position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Sparkle corners */}
        {['top:12px;left:16px','top:12px;right:16px','bottom:12px;left:16px','bottom:12px;right:16px'].map((pos, i) => (
          <span key={i} style={{ position: 'absolute', ...Object.fromEntries(pos.split(';').map(p => p.split(':'))), fontSize: '20px', color: '#f4b8cc', animation: `egg-sparkle 1.4s ease-in-out ${i * 0.3}s infinite` }}>✦</span>
        ))}

        <h2 style={{ fontFamily: "'Kapakana', cursive", fontSize: '38px', color: '#6b1230', marginBottom: '12px', fontWeight: 700 }}>
          Look what you figured out!
        </h2>
        <p style={{ fontSize: '13px', fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c06080', lineHeight: 1.8, marginBottom: '32px' }}>
          You found the secret ✦<br/>You're clearly a person of culture.
        </p>
        <button
          onClick={() => setOpen(false)}
          style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: '11px', fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', backgroundColor: '#6b1230', color: '#f8f6eb', border: 'none', padding: '12px 28px', cursor: 'pointer' }}
        >
          Okay hehe ✦
        </button>
      </div>
    </div>
  )
}

function NavIndicator({ activeSection, onScrollTo }: { activeSection: string; onScrollTo: (s: string) => void }): React.ReactElement {
  const navRef = useRef<HTMLUListElement>(null)
  const pillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const nav = navRef.current
    const pill = pillRef.current
    if (!nav || !pill) return
    const activeBtn = nav.querySelector(`[data-link="${activeSection}"]`) as HTMLElement
    if (!activeBtn) return
    const navRect = nav.getBoundingClientRect()
    const btnRect = activeBtn.getBoundingClientRect()
    pill.style.left = `${btnRect.left - navRect.left}px`
    pill.style.width = `${btnRect.width}px`
    pill.style.opacity = '1'
  }, [activeSection])

  return (
    <div className="hidden-mobile" style={{ position: 'relative' }}>
      {/* sliding pill */}
      <div ref={pillRef} style={{
        position: 'absolute', bottom: '-4px', height: '2px',
        backgroundColor: '#6b1230', borderRadius: '99px',
        transition: 'left 0.35s cubic-bezier(0.34,1.56,0.64,1), width 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        opacity: 0, pointerEvents: 'none',
      }} />
      <ul ref={navRef} style={{ display: 'flex', gap: '48px', listStyle: 'none', margin: 0, padding: 0 }}>
        {NAV_LINKS.map(link => (
          <li key={link}>
            <button
              data-link={link}
              onClick={() => onScrollTo(link)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: '13px',
                fontWeight: activeSection === link ? 600 : 300,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: activeSection === link ? '#6b1230' : '#9a4060',
                padding: '0 0 6px 0',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#6b1230'; e.currentTarget.style.fontWeight = '600' }}
              onMouseLeave={e => { e.currentTarget.style.color = activeSection === link ? '#6b1230' : '#9a4060'; e.currentTarget.style.fontWeight = activeSection === link ? '600' : '300' }}
            >
              {link}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SkillBar({ label, level, delay }: { label: string; level: number; delay: number }): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null)
  const [filled, setFilled] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setTimeout(() => setFilled(true), delay); obs.disconnect() }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])
  return (
    <div ref={ref} style={{ opacity: filled ? 1 : 0, transform: filled ? 'translateY(0)' : 'translateY(16px)', transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ fontSize: '12px', fontWeight: 300, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b1230' }}>{label}</div>
        <div style={{ fontSize: '10px', fontWeight: 300, letterSpacing: '0.1em', color: '#c06080', opacity: filled ? 1 : 0, transition: `opacity 0.3s ease ${delay + 600}ms` }}>{level}%</div>
      </div>
      <div style={{ height: '3px', backgroundColor: '#e8b0c0', borderRadius: '99px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: '99px',
          background: 'linear-gradient(to right, #6b1230, #c06080)',
          width: filled ? level + '%' : '0%',
          transition: `width 1s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        }} />
      </div>
    </div>
  )
}

function TypewriterHeadline(): React.ReactElement {
  const { displayed, done } = useTypewriter('Creating Unique Experiences for Users')
  return (
    <>
      {displayed}
      <span style={{ borderRight: done ? '2px solid #6b1230' : '2px solid #6b1230', marginLeft: '2px', animation: 'blink-cursor 0.8s step-end infinite', display: 'inline-block', verticalAlign: 'text-bottom', height: '0.85em' }} />
      <style>{`@keyframes blink-cursor { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </>
  )
}

function TiltPhone(): React.ReactElement {
  const wrapRef = useRef<HTMLDivElement>(null)
  const glossRef = useRef<HTMLDivElement>(null)
  const shadowRef = useRef<HTMLDivElement>(null)

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const rect = container.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2)
    const dy = (e.clientY - cy) / (rect.height / 2)

    const el = wrapRef.current
    if (el) {
      el.style.transform = `rotateY(${dx * 18}deg) rotateX(${-dy * 14}deg) translateZ(20px)`
      // drop-shadow follows the phone's actual rounded shape
      const sx = -dx * 16
      const sy = dy * 10 + 22
      el.style.filter = `drop-shadow(${sx}px ${sy}px 28px rgba(0,0,0,0.4))`
    }

    const gloss = glossRef.current
    if (gloss) {
      const gx = 50 - dx * 35
      const gy = 50 - dy * 35
      gloss.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 45%, transparent 70%)`
      gloss.style.opacity = '1'
    }

    const shadow = shadowRef.current
    if (shadow) {
      shadow.style.transform = `translateX(${dx * 24}px) scaleX(${1 - Math.abs(dx) * 0.2})`
      shadow.style.opacity = `${0.35 + Math.abs(dx) * 0.1 + Math.abs(dy) * 0.1}`
    }
  }, [])

  const onMouseLeave = useCallback(() => {
    const el = wrapRef.current
    if (el) { el.style.transform = 'rotateY(0deg) rotateX(0deg) translateZ(0px)'; el.style.filter = 'drop-shadow(0px 20px 24px rgba(0,0,0,0.22))' }
    const gloss = glossRef.current
    if (gloss) gloss.style.opacity = '0'
    const shadow = shadowRef.current
    if (shadow) { shadow.style.transform = 'translateX(0) scaleX(1)'; shadow.style.opacity = '0.25' }
  }, [])

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', perspective: '600px', perspectiveOrigin: '50% 50%' }}
      onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
    >
      <div ref={wrapRef} style={{ position: 'relative', transformStyle: 'preserve-3d', transition: 'transform 0.12s cubic-bezier(0.22,1,0.36,1), filter 0.12s ease', filter: 'drop-shadow(0px 20px 24px rgba(0,0,0,0.22))' }}>
        <IPhoneMockup />

        {/* Gloss overlay — sits above the phone, follows light */}
        <div ref={glossRef} style={{
          position: 'absolute', inset: 0,
          borderRadius: '44px',
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 0.15s ease',
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.18) 0%, transparent 70%)',
          zIndex: 10,
        }} />

      </div>

      {/* Ground shadow ellipse */}
      <div ref={shadowRef} style={{
        width: '200px', height: '20px', marginTop: '16px',
        background: 'radial-gradient(ellipse, rgba(107,18,48,0.35) 0%, transparent 75%)',
        borderRadius: '50%',
        transition: 'transform 0.12s cubic-bezier(0.22,1,0.36,1), opacity 0.12s ease',
        opacity: 0.25,
        flexShrink: 0,
      }} />
    </div>
  )
}

function PlaceholderCard({ label, type, skills }: { label: string; type: string; skills: string[] }): React.ReactElement {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{ border: '1px solid #e8d0d8', borderRadius: '2px', overflow: 'hidden', backgroundColor: '#fff', position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Blurred thumbnail */}
      <div style={{ position: 'relative', height: '220px', backgroundColor: '#f0e8ec', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, filter: 'blur(24px)', transform: 'scale(1.2)' }}>
          <div style={{ position: 'absolute', top: '10%', left: '5%', width: '60%', height: '30%', backgroundColor: '#f5c8d8', borderRadius: '4px' }} />
          <div style={{ position: 'absolute', top: '20%', left: '10%', width: '80%', height: '12%', backgroundColor: '#e8b0c0', borderRadius: '4px' }} />
          <div style={{ position: 'absolute', top: '40%', left: '5%', width: '45%', height: '8%', backgroundColor: '#c06080', borderRadius: '4px' }} />
          <div style={{ position: 'absolute', top: '55%', left: '5%', width: '70%', height: '8%', backgroundColor: '#d4a0b8', borderRadius: '4px' }} />
          <div style={{ position: 'absolute', top: '70%', left: '5%', width: '55%', height: '8%', backgroundColor: '#e8b0c0', borderRadius: '4px' }} />
          <div style={{ position: 'absolute', top: '10%', right: '5%', width: '25%', height: '75%', backgroundColor: '#b5c97a', borderRadius: '4px', opacity: 0.5 }} />
        </div>
        {/* Hover skills overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundColor: '#6b1230ee', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px', gap: '10px', opacity: hovered ? 1 : 0, transition: 'opacity 0.25s ease' }}>
          <p style={{ fontSize: '9px', fontWeight: 300, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#f5c8d8', marginBottom: '4px', opacity: 0.7 }}>Skills Used</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {skills.map((s, i) => (
              <span key={i} style={{ fontSize: '9px', fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#f8f6eb', backgroundColor: '#ffffff18', border: '1px solid #ffffff30', borderRadius: '999px', padding: '4px 10px', whiteSpace: 'nowrap' }}>{s}</span>
            ))}
          </div>
        </div>
        {/* Default overlay (hidden on hover) */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)', opacity: hovered ? 0 : 1, transition: 'opacity 0.25s ease' }}>
          <div style={{ backgroundColor: '#6b123022', border: '1px solid #6b123044', borderRadius: '999px', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="4" width="10" height="7" rx="1.5" stroke="#6b1230" strokeWidth="1.2"/><path d="M3.5 4V3a2.5 2.5 0 015 0v1" stroke="#6b1230" strokeWidth="1.2" strokeLinecap="round"/></svg>
            <span style={{ fontSize: '9px', fontWeight: 300, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#6b1230' }}>Coming Soon</span>
          </div>
        </div>
      </div>
      {/* Card footer */}
      <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 300, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b1230', marginBottom: '4px' }}>{label}</p>
          <p style={{ fontSize: '10px', fontWeight: 300, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c06080' }}>{type}</p>
        </div>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #e8d0d8', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="#6b1230" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>
    </div>
  )
}

function IPhoneMockup() {
  return (
    <div style={{
      transform: 'rotate(8deg) translateY(-16px)',
      position: 'relative',
      zIndex: 2,
    }}>
      {/* Phone frame */}
      <div style={{
        width: '260px',
        height: '530px',
        backgroundColor: '#1a1a1a',
        borderRadius: '44px',
        padding: '10px',
        boxShadow: 'none',
        position: 'relative',
      }}>
        {/* Side buttons */}
        <div style={{ position: 'absolute', left: '-3px', top: '100px', width: '3px', height: '36px', backgroundColor: '#2a2a2a', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', left: '-3px', top: '148px', width: '3px', height: '64px', backgroundColor: '#2a2a2a', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', left: '-3px', top: '224px', width: '3px', height: '64px', backgroundColor: '#2a2a2a', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', right: '-3px', top: '160px', width: '3px', height: '80px', backgroundColor: '#2a2a2a', borderRadius: '0 2px 2px 0' }} />

        {/* Screen */}
        <div style={{
          width: '100%', height: '100%',
          backgroundColor: '#f5c8d8',
          borderRadius: '36px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Dynamic Island */}
          <div style={{
            position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
            width: '96px', height: '28px',
            backgroundColor: '#1a1a1a',
            borderRadius: '20px',
            zIndex: 10,
          }} />

          {/* Screen content */}
          <div style={{ paddingTop: '52px', height: '100%', position: 'relative' }}>
            <img
              src="/assets/phone-bg.png"
              alt="Ava Smolley"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', imageRendering: 'auto' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [activeSection, setActiveSection] = useState('Home')
  const [menuOpen, setMenuOpen] = useState(false)

  const scrollTo = (id: string) => {
    setActiveSection(id)
    setMenuOpen(false)
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id
            const match = NAV_LINKS.find(l => l.toLowerCase() === id)
            if (match) setActiveSection(match)
          }
        })
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    )
    NAV_LINKS.forEach(link => {
      const el = document.getElementById(link.toLowerCase())
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div style={{ fontFamily: "'Josefin Sans', sans-serif", backgroundColor: '#f8f6eb', color: '#6b1230' }}>
      <CursorTrail />
      <SparkleClick />
      <EasterEgg />

      {/* Navbar */}
      <nav style={{ backgroundColor: '#f5c8d8', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 4px 24px rgba(107,18,48,0.10)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
          {/* Name - stacked */}
          <button
            onClick={() => { scrollTo('Home'); window.dispatchEvent(new Event('logo-click')) }}
            style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#6b1230', lineHeight: 1 }}
          >
            <div style={{ fontFamily: "'Kapakana', cursive", fontSize: '50px', fontWeight: 700, letterSpacing: '0.02em', color: '#6b1230' }}>Ava Smolley</div>
          </button>

          {/* Desktop nav */}
          <NavIndicator activeSection={activeSection} onScrollTo={scrollTo} />

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="show-mobile"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b1230', fontSize: '22px', display: 'none' }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ backgroundColor: '#f5c8d8', borderTop: '1px solid #e8b0c0', padding: '16px 40px 24px' }}>
            {NAV_LINKS.map(link => (
              <button
                key={link}
                onClick={() => scrollTo(link)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontSize: '13px',
                  fontWeight: activeSection === link ? 600 : 300,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: activeSection === link ? '#6b1230' : '#9a4060',
                  borderBottom: activeSection === link ? '1px solid #6b1230' : '1px solid transparent',
                  padding: '10px 0',
                  transition: 'color 0.2s, font-weight 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#6b1230'; e.currentTarget.style.fontWeight = '600' }}
                onMouseLeave={e => { e.currentTarget.style.color = activeSection === link ? '#6b1230' : '#9a4060'; e.currentTarget.style.fontWeight = activeSection === link ? '600' : '300' }}
              >
                {link}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Hero */}
      <section id="home" style={{ backgroundColor: '#f8f6eb', minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        {/* Orange aura */}
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: '700px', height: '700px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217,64,37,0.22) 0%, rgba(217,64,37,0.08) 45%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '20%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217,64,37,0.14) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '30%', left: '-8%',
          width: '450px', height: '450px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217,64,37,0.12) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', left: '5%',
          width: '280px', height: '280px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217,64,37,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '10%', left: '35%',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217,64,37,0.08) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '80px 40px 60px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          {/* Left: text */}
          <div>
            <p style={{ fontSize: '13px', fontWeight: 300, letterSpacing: '0.18em', textTransform: 'capitalize', color: '#c06080', marginBottom: '20px' }}>
              User Experience &amp; Full Stack Development
            </p>
            <h1 style={{ fontSize: 'clamp(32px, 4vw, 58px)', fontWeight: 300, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.15, color: '#6b1230', marginBottom: '32px', minHeight: '2.5em' }}>
              <TypewriterHeadline />
            </h1>
            <p style={{ fontSize: '12px', fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c06080', marginBottom: '48px' }}>
              based in pennsylvania — Current Undergraduate at Penn State
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={() => scrollTo('Projects')}
                style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontSize: '12px', fontWeight: 300, letterSpacing: '0.2em',
                  textTransform: 'uppercase', cursor: 'pointer',
                  backgroundColor: '#6b1230', color: '#f8f6eb',
                  border: 'none', padding: '14px 32px',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#4a0d22')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#6b1230')}
              >
                View Work
              </button>
              <button
                onClick={() => scrollTo('Contact')}
                style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontSize: '12px', fontWeight: 300, letterSpacing: '0.2em',
                  textTransform: 'uppercase', cursor: 'pointer',
                  backgroundColor: 'transparent', color: '#6b1230',
                  border: '1px solid #6b1230', padding: '14px 32px',
                  transition: 'background-color 0.2s, color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#6b1230'; e.currentTarget.style.color = '#f8f6eb' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6b1230' }}
              >
                Get in Touch
              </button>
            </div>
          </div>

          {/* Right: iPhone mockup with parallax tilt */}
          <TiltPhone />
        </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '28px', flexShrink: 0 }}>
          <style>{`
            @keyframes scroll-bounce {
              0%, 100% { transform: translateY(0); opacity: 0.5; }
              50% { transform: translateY(8px); opacity: 1; }
            }
          `}</style>
          <button
            onClick={() => scrollTo('Projects')}
            style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#6b1230' }}
          >
            <span style={{ fontSize: '9px', fontWeight: 300, letterSpacing: '0.25em', textTransform: 'uppercase', opacity: 0.5 }}>scroll</span>
            <svg
              width="20" height="20" viewBox="0 0 20 20" fill="none"
              style={{ animation: 'scroll-bounce 1.6s ease-in-out infinite' }}
            >
              <path d="M4 7 L10 13 L16 7" stroke="#6b1230" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Skills ticker — bottom of hero */}
        <div style={{ backgroundColor: '#b5c97a', height: '56px', display: 'flex', alignItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
          <style>{`
            @keyframes ticker {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .skills-ticker {
              display: flex;
              width: max-content;
              animation: ticker 28s linear infinite;
            }
            .skills-ticker:hover { animation-play-state: paused; }
          `}</style>
          <div className="skills-ticker">
            {[...Array(2)].flatMap((_, copy) =>
              ['Java', 'Python', 'C/C++', 'Kotlin', 'HTML', 'XML', 'CSS', 'Figma', 'Miro', 'Adobe', 'UI/UX Design', 'Rapid Prototyping', 'Brainstorming']
                .map((t, i) => (
                  <span key={`${copy}-${i}`} style={{ fontSize: '11px', fontWeight: 300, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#3a5010', padding: '0 32px', whiteSpace: 'nowrap' }}>
                    {t} <span style={{ opacity: 0.4, marginLeft: '32px' }}>★</span>
                  </span>
                ))
            )}
          </div>
        </div>
      </section>


      {/* Projects */}
      <section id="projects" style={{ backgroundColor: '#f8f6eb', padding: '100px 40px' }}>
        <style>{`
          @keyframes crane-swing {
            0%, 100% { transform: rotate(-4deg); }
            50% { transform: rotate(4deg); }
          }
          @keyframes bounce-dots {
            0%, 80%, 100% { opacity: 0.2; transform: translateY(0); }
            40% { opacity: 1; transform: translateY(-6px); }
          }
          .crane { animation: crane-swing 2.4s ease-in-out infinite; transform-origin: top center; }
          .dot1 { animation: bounce-dots 1.4s ease-in-out infinite 0s; }
          .dot2 { animation: bounce-dots 1.4s ease-in-out infinite 0.2s; }
          .dot3 { animation: bounce-dots 1.4s ease-in-out infinite 0.4s; }
        `}</style>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <Reveal>
          <p style={{ fontSize: '12px', fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c06080', marginBottom: '12px' }}>Selected Work</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 300, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b1230', marginBottom: '64px' }}>Projects</h2>
          </Reveal>

          <Reveal delay={100}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center', gap: '32px' }}>

            {/* Crane SVG */}
            <div className="crane">
              <svg width="80" height="100" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Mast */}
                <rect x="38" y="10" width="4" height="70" fill="#6b1230" rx="2"/>
                {/* Boom arm */}
                <rect x="10" y="10" width="60" height="3" fill="#6b1230" rx="1.5"/>
                {/* Counter arm */}
                <rect x="10" y="10" width="18" height="3" fill="#9a4060" rx="1.5"/>
                {/* Cable */}
                <line x1="60" y1="13" x2="60" y2="50" stroke="#6b1230" strokeWidth="1.5"/>
                {/* Hook */}
                <path d="M57 50 Q60 56 63 50" stroke="#6b1230" strokeWidth="2" fill="none" strokeLinecap="round"/>
                {/* Ball on counter */}
                <circle cx="14" cy="20" r="5" fill="#b5c97a"/>
                {/* Wheels */}
                <rect x="28" y="78" width="24" height="8" fill="#c06080" rx="2"/>
                <circle cx="33" cy="86" r="4" fill="#6b1230"/>
                <circle cx="47" cy="86" r="4" fill="#6b1230"/>
              </svg>
            </div>

            {/* Text */}
            <div>
              <p style={{ fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 300, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b1230', marginBottom: '16px' }}>
                Under Construction
              </p>
              <p style={{ fontSize: '14px', fontWeight: 300, letterSpacing: '0.06em', color: '#c06080', maxWidth: '420px', lineHeight: 1.8, marginBottom: '24px' }}>
                Projects are on the way — I am currently building on my portfolio as an undergraduate student in Human Centered Design &amp; Development at Penn State. Check back soon!
              </p>
              {/* Bouncing dots */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <span className="dot1" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6b1230' }} />
                <span className="dot2" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#c06080' }} />
                <span className="dot3" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#b5c97a' }} />
              </div>
            </div>

            {/* Caution stripe */}
            <div style={{ width: '100%', maxWidth: '480px', height: '10px', borderRadius: '4px', background: 'repeating-linear-gradient(45deg, #6b1230, #6b1230 10px, #f5c8d8 10px, #f5c8d8 20px)' }} />
          </div>
          </Reveal>

          {/* Placeholder cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginTop: '64px' }}>
            {[
              { label: 'Shopping Website', type: 'Full-Stack', skills: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'CRUD Operations', 'React / AngularJS', 'Database Integration', 'Front-End Development', 'End-to-End Functionality'] },
              { label: 'Calendar App', type: 'UX Research / Project', skills: ['Figma', 'Miro', 'User Research', 'Wireframing & Prototyping', 'Agile Methodologies'] },
            ].map((card, i) => (
              <Reveal key={i} delay={i * 120}>
                <PlaceholderCard label={card.label} type={card.type} skills={card.skills} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pink divider */}
      <div style={{ backgroundColor: '#f5c8d8', height: '2px' }} />

      {/* About */}
      <section id="about" style={{ backgroundColor: '#f8f6eb', padding: '100px 40px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <Reveal from="left">
          <div>
            <p style={{ fontSize: '12px', fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c06080', marginBottom: '12px' }}>About Me</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 300, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b1230', marginBottom: '32px', lineHeight: 1.2 }}>
              Ava Smolley
            </h2>
            <p style={{ fontSize: '15px', fontWeight: 300, lineHeight: 1.8, color: '#6b1230', marginBottom: '24px', opacity: 0.85 }}>
              I'm an undergraduate student studying Human Centered Design &amp; Development at Penn State, with a focus on front-end development and UX design. I love bridging the gap between how things look and how they work — turning ideas into real, usable experiences.
            </p>
            <p style={{ fontSize: '15px', fontWeight: 300, lineHeight: 1.8, color: '#6b1230', opacity: 0.85, marginBottom: '32px' }}>
              With 6+ years of coding experience and now 3 years learning the process of UX research and design, I am continuously growing my knowledge and skills and bettering my work. I am always up for a challenge and to learn more.
            </p>
            {/* Available badge + Resume — always stacked */}
            <style>{`@keyframes pulse-dot { 0%,100%{box-shadow:0 0 0 3px #b5c97a33} 50%{box-shadow:0 0 0 6px #b5c97a11} }`}</style>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ position: 'relative' }}
                onMouseEnter={e => { const tip = e.currentTarget.querySelector('.avail-tip') as HTMLElement; if (tip) { tip.style.opacity = '1'; tip.style.transform = 'translateX(-50%) translateY(0)'; } }}
                onMouseLeave={e => { const tip = e.currentTarget.querySelector('.avail-tip') as HTMLElement; if (tip) { tip.style.opacity = '0'; tip.style.transform = 'translateX(-50%) translateY(4px)'; } }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#b5c97a22', border: '1px solid #b5c97a88', borderRadius: '999px', padding: '6px 14px 6px 10px', width: 'fit-content' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#b5c97a', display: 'inline-block', boxShadow: '0 0 0 3px #b5c97a33', animation: 'pulse-dot 2s ease-in-out infinite' }} />
                  <span style={{ fontSize: '10px', fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#3a5010' }}>Currently Available for Work</span>
                </div>
                <div className="avail-tip" style={{ position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%) translateY(4px)', backgroundColor: '#6b1230', color: '#f8f6eb', fontSize: '10px', fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '6px 14px', borderRadius: '4px', whiteSpace: 'nowrap', opacity: 0, transition: 'opacity 0.2s ease, transform 0.2s ease', pointerEvents: 'none', zIndex: 10 }}>
                  Internships or Co-Ops
                  <div style={{ position: 'absolute', top: '-4px', left: '50%', transform: 'translateX(-50%)', width: '8px', height: '8px', backgroundColor: '#6b1230', rotate: '45deg' }} />
                </div>
              </div>
              <a
                href="/assets/resume.pdf"
                download="Ava_Smolley_Resume.pdf"
                style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontSize: '12px', fontWeight: 300, letterSpacing: '0.2em',
                  textTransform: 'uppercase', textDecoration: 'none',
                  backgroundColor: 'transparent', color: '#6b1230',
                  border: '1px solid #b5c97a', padding: '14px 32px',
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  transition: 'background-color 0.2s, color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#b5c97a'; e.currentTarget.style.color = '#3a5010' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6b1230' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3 6l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Download Resume
              </a>
            </div>
          </div>
          </Reveal>
          <Reveal from="right" delay={150}>
          <div style={{ position: 'relative' }}>
            <div style={{ backgroundColor: '#b5c97a', position: 'absolute', top: '-16px', left: '-16px', width: '100%', height: '100%' }} />
            <img
              src="/assets/about-photo.jpg"
              alt="Ava Smolley"
              style={{ width: '100%', height: '480px', objectFit: 'cover', position: 'relative', display: 'block' }}
            />
          </div>
          </Reveal>
        </div>
      </section>

      {/* Skills strip */}
      <div style={{ backgroundColor: '#f5c8d8', padding: '64px 40px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <Reveal>
          <p style={{ fontSize: '12px', fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6b1230', marginBottom: '40px', opacity: 0.6 }}>Expertise</p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '32px' }}>
            {SKILLS.map((s, i) => (
              <SkillBar key={i} label={s.label} level={s.level} delay={i * 80} />
            ))}
          </div>
        </div>
      </div>

      {/* Contact */}
      <section id="contact" style={{ backgroundColor: '#6b1230', padding: '100px 40px', color: '#f8f6eb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
          <p style={{ fontSize: '12px', fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#f5c8d8', marginBottom: '16px', opacity: 0.7 }}>Let's Connect</p>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 300, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f8f6eb', marginBottom: '24px', lineHeight: 1.2 }}>
            Have a project in mind?
          </h2>
          <p style={{ fontSize: '15px', fontWeight: 300, lineHeight: 1.8, color: '#f5c8d8', marginBottom: '48px', opacity: 0.8 }}>
            I'm always open to discussing new opportunities, collaborations, or just a conversation about design and code.
          </p>
          <a
            href="mailto:smolleya24@gmail.com"
            style={{
              display: 'inline-block',
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: '12px', fontWeight: 300, letterSpacing: '0.2em',
              textTransform: 'uppercase', textDecoration: 'none',
              backgroundColor: '#f5c8d8', color: '#6b1230',
              padding: '16px 40px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#b5c97a')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#f5c8d8')}
          >
            smolleya24@gmail.com
          </a>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#4a0d22', padding: '32px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <span style={{ fontSize: '12px', fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#f5c8d8', opacity: 0.5 }}>
          © 2026 Ava Smolley
        </span>
        <div style={{ display: 'flex', gap: '32px' }}>
          <a href="https://www.linkedin.com/in/ava-smolley-62551032b/" target="_blank" rel="noreferrer" style={{ fontSize: '11px', fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#f5c8d8', textDecoration: 'none', opacity: 0.5, transition: 'opacity 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
          >LinkedIn</a>
          <a href="https://github.com/avasmolls" target="_blank" rel="noreferrer" style={{ fontSize: '11px', fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#f5c8d8', textDecoration: 'none', opacity: 0.5, transition: 'opacity 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
          >GitHub</a>
        </div>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
          #home > div > div { grid-template-columns: 1fr !important; }
          #home > div > div > div:last-child { display: none; }
          #about > div { grid-template-columns: 1fr !important; }
          #about > div > div:last-child { display: none; }
        }
      `}</style>
    </div>
  )
}

function ProjectCard({ project }: { project: typeof PROJECTS[0] }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', aspectRatio: '4/3', backgroundColor: project.bg }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={project.image}
        alt={project.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: hovered ? 'rgba(107,18,48,0.85)' : 'rgba(107,18,48,0)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '32px', transition: 'background-color 0.4s ease',
      }}>
        <p style={{ fontSize: '11px', fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#f5c8d8', opacity: hovered ? 1 : 0, transition: 'opacity 0.3s', marginBottom: '8px' }}>
          {project.category}
        </p>
        <h3 style={{ fontSize: '18px', fontWeight: 300, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f8f6eb', opacity: hovered ? 1 : 0, transition: 'opacity 0.3s 0.05s', marginBottom: '12px' }}>
          {project.title}
        </h3>
        <p style={{ fontSize: '13px', fontWeight: 300, color: '#f5c8d8', opacity: hovered ? 0.85 : 0, transition: 'opacity 0.3s 0.1s', lineHeight: 1.6 }}>
          {project.description}
        </p>
      </div>
    </div>
  )
}

const PROJECTS = [
  {
    title: 'Bloom Health App',
    category: 'UX Design · iOS',
    description: 'A wellness tracking app helping users build sustainable habits through gentle, data-driven nudges.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=450&fit=crop&auto=format',
    bg: '#d4e8a8',
  },
  {
    title: 'Maison Editorial',
    category: 'Web Design · Development',
    description: 'A digital magazine platform built for long-form reading with a focus on typography and pacing.',
    image: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=600&h=450&fit=crop&auto=format',
    bg: '#f5c8d8',
  },
  {
    title: 'Solen Dashboard',
    category: 'Product Design · React',
    description: 'An analytics dashboard for a solar energy company — making complex data feel approachable.',
    image: 'https://images.unsplash.com/photo-1545158535-c3f7168c28b6?w=600&h=450&fit=crop&auto=format',
    bg: '#e8d4c0',
  },
  {
    title: 'Folio Brand Identity',
    category: 'Branding · Motion',
    description: 'Full visual identity for a creative studio — from wordmark to motion language to print assets.',
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&h=450&fit=crop&auto=format',
    bg: '#c8d4f5',
  },
]

const SKILLS = [
  { label: 'UX / UI Design', level: 95 },
  { label: 'Figma', level: 98 },
  { label: 'Java/Python', level: 88 },
  { label: 'HTML/CSS', level: 82 },
  { label: 'JavaScript', level: 75 },
  { label: 'SQL', level: 70 },
]
