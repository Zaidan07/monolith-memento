"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
import { HERO_SLIDES, heroImageUrl } from "../lib/hero-slides"

const slides = [...HERO_SLIDES].sort((a, b) => a.sortOrder - b.sortOrder)

export function HeroCarousel({ children }: { children: ReactNode }) {
  const [{ index, previous }, setFrame] = useState({ index: 0, previous: -1 })
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [paused, setPaused] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [failed, setFailed] = useState<number[]>([])
  const [touching, setTouching] = useState(false)
  const start = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPaused(media.matches)
    const visibility = () => setHidden(document.hidden)
    const preference = () => setPaused(media.matches)
    visibility()
    document.addEventListener("visibilitychange", visibility)
    media.addEventListener("change", preference)
    return () => {
      document.removeEventListener("visibilitychange", visibility)
      media.removeEventListener("change", preference)
    }
  }, [])

  const stopped = hovered || focused || paused || hidden || touching
  useEffect(() => {
    if (stopped || slides.length < 2) return
    const timer = window.setTimeout(() => setFrame(({ index }) => ({ index: (index + 1) % slides.length, previous: index })), 3000)
    return () => window.clearTimeout(timer)
  }, [index, stopped])

  function move(direction: number) {
    setFrame(({ index }) => ({ index: (index + direction + slides.length) % slides.length, previous: index }))
  }

  const slide = slides[index]
  if (!slide) return null

  return (
    <div className="hero-carousel" role="region" aria-roledescription="carousel" aria-label="Stella Sora CG gallery"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)} onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
      }}
      onTouchStart={(event) => {
        if (event.touches.length !== 1) { start.current = null; return }
        start.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }
        setTouching(true)
      }}
      onTouchEnd={(event) => {
        setTouching(false)
        if (!start.current || !event.changedTouches.length) return
        const dx = event.changedTouches[0].clientX - start.current.x
        const dy = event.changedTouches[0].clientY - start.current.y
        start.current = null
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1)
      }}
      onTouchCancel={() => { start.current = null; setTouching(false) }}>
      <div className="hero-backdrop" aria-hidden="true">
        {slides.map((frame, position) => {
          const active = position === index
          const adjacent = (position - index + slides.length) % slides.length
          const nearby = adjacent === 1 || adjacent === slides.length - 1
          const url = heroImageUrl(frame)
          return (
            <div key={frame.id} className="hero-slide" data-active={active}>
              {(active || nearby || position === previous) && url && !failed.includes(frame.id) && (
                <Image src={url} alt="" fill sizes="(max-width: 600px) calc(100vw - 32px), (max-width: 1224px) calc(100vw - 64px), 1160px"
                  loading={active || adjacent === 1 ? "eager" : "lazy"}
                  fetchPriority={active && index === 0 && previous === -1 ? "high" : undefined}
                  draggable={false}
                  onError={() => setFailed((current) => [...current, frame.id])} />
              )}
            </div>
          )
        })}
      </div>
      {children}
      <div className="hero-carousel-bar">
        <p className="hero-slide-title" aria-live={stopped ? "polite" : "off"}>{slide.title}</p>
        <div className="hero-carousel-controls">
          <button type="button" aria-label="Previous CG" onClick={() => move(-1)}><ChevronLeft size={18} aria-hidden="true" /></button>
          <span className="hero-slide-counter">{String(index + 1).padStart(2, "0")}/{String(slides.length).padStart(2, "0")}</span>
          <button type="button" aria-label="Next CG" onClick={() => move(1)}><ChevronRight size={18} aria-hidden="true" /></button>
          <button type="button" aria-label={paused ? "Play carousel" : "Pause carousel"} onClick={() => setPaused((value) => !value)}>
            {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </div>
  )
}
