"use client"

import { useEffect, useRef, useState } from "react"
import { Sparkles } from "lucide-react"
import { saveMoment } from "../app/moments/actions"
import { downloadMoment } from "../lib/moment-png"
import { drawMoment, findMoment, moments, type MomentPull } from "../lib/moments"
import { normalizePlayerName, readPlayerName } from "../lib/player-name"
import { MomentCard, MomentImage } from "./moment-card"
import { PlayerNameField } from "./player-name-field"

const collectionKey = "stella-sora-pick:my-moments"

function readCollection(): Record<string, MomentPull> {
  try {
    const source = JSON.parse(localStorage.getItem(collectionKey) ?? "{}")
    if (!source || typeof source !== "object") return {}
    return Object.fromEntries(moments.flatMap(({ slug }) => {
      const entry = source[slug]
      return typeof entry?.pulledAt === "string" && Number.isFinite(Date.parse(entry.pulledAt))
        ? [[slug, { slug, pulledAt: entry.pulledAt, playerName: normalizePlayerName(entry.playerName) }]]
        : []
    }))
  } catch {
    return {}
  }
}

export function MomentEditor() {
  const [collection, setCollection] = useState<Record<string, MomentPull>>({})
  const [pull, setPull] = useState<MomentPull | null>(null)
  const [filter, setFilter] = useState<"all" | 4 | 5>("all")
  const [busy, setBusy] = useState<"pull" | "save" | "download" | null>(null)
  const [shuffle, setShuffle] = useState("")
  const [status, setStatus] = useState("")
  const [share, setShare] = useState("")
  const [ready, setReady] = useState(false)
  const animation = useRef<{ timer: number; interval: number } | null>(null)
  const active = useRef(false)

  useEffect(() => {
    setCollection(readCollection())
    setReady(true)
    return () => {
      if (animation.current) {
        window.clearTimeout(animation.current.timer)
        window.clearInterval(animation.current.interval)
      }
    }
  }, [])

  function revealMoment() {
    if (!ready || active.current) return
    active.current = true
    const moment = drawMoment()
    const playerName = readPlayerName()
    const finish = () => {
      const nextPull = { slug: moment.slug, pulledAt: new Date().toISOString(), playerName }
      const existing = { ...collection, ...readCollection() }
      const nextCollection = { ...existing, [moment.slug]: existing[moment.slug] ?? nextPull }
      setCollection(nextCollection)
      setPull(nextPull)
      setStatus(`${moment.name} · ★${moment.grade}`)
      try {
        localStorage.setItem(collectionKey, JSON.stringify(nextCollection))
      } catch {
        setStatus(`${moment.name} · ★${moment.grade}. This browser could not save your collection.`)
      }
      active.current = false
      setBusy(null)
    }

    setShare("")
    setStatus("")
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish()
      return
    }
    setBusy("pull")
    const shuffleName = () => setShuffle(moments[Math.floor(Math.random() * moments.length)].name)
    shuffleName()
    const interval = window.setInterval(shuffleName, 85)
    const timer = window.setTimeout(() => {
      window.clearInterval(interval)
      animation.current = null
      finish()
    }, 820)
    animation.current = { timer, interval }
  }

  const result = pull && findMoment(pull.slug)

  async function run(mode: "save" | "download") {
    if (!pull || !result || active.current) return
    active.current = true
    setBusy(mode)
    setStatus("")
    try {
      if (mode === "download") {
        await downloadMoment(result, pull)
        setStatus("PNG ready.")
      } else {
        const saved = await saveMoment(result.slug, pull.playerName, pull.pulledAt)
        if (saved.error) setStatus(saved.error)
        else if (saved.id) {
          setShare(new URL(`/share/moment/${saved.id}`, window.location.origin).href)
          setStatus("Share link ready.")
        }
      }
    } catch (error) {
      setStatus(mode === "download" && error instanceof Error ? error.message : "Could not save this moment.")
    } finally {
      active.current = false
      setBusy(null)
    }
  }

  const collected = moments.filter(({ slug, grade }) => collection[slug] && (filter === "all" || grade === filter))

  return (
    <>
      <div className="moment-stage">
        <PlayerNameField disabled={!ready || !!busy} />
        {busy === "pull" ? (
          <div className="moment-placeholder moment-shuffle" aria-label="Pulling a moment">
            <Sparkles aria-hidden="true" size={36} /><span aria-hidden="true">{shuffle}</span>
          </div>
        ) : pull && result ? (
          <MomentCard key={pull.pulledAt} moment={result} pull={pull} />
        ) : (
          <div className="moment-placeholder"><Sparkles aria-hidden="true" size={36} /><span>Pull a Moment to reveal a snapshot.</span></div>
        )}
        <div className="favorite-actions">
          <button type="button" className="favorite-primary" onClick={revealMoment} disabled={!ready || !!busy}>
            {busy === "pull" ? "Pulling…" : pull ? "Pull again" : "Pull a Moment"}
          </button>
          {pull && <>
            <button type="button" onClick={() => run("save")} disabled={!!busy || !!share}>{busy === "save" ? "Saving…" : "Save moment"}</button>
            <button type="button" onClick={() => run("download")} disabled={!!busy}>{busy === "download" ? "Exporting…" : "Download PNG"}</button>
          </>}
        </div>
        {share && <div className="favorite-share">
          <a href={share}>Open shared moment</a>
          <button type="button" onClick={async () => {
            try { await navigator.clipboard.writeText(share); setStatus("Share link copied.") }
            catch { setStatus("Open the shared moment to copy its URL.") }
          }}>Copy link</button>
        </div>}
        <p className="favorite-status" role="status">{status}</p>
      </div>
      <section className="moment-collection" aria-labelledby="my-moments">
        <div className="favorite-heading">
          <h2 id="my-moments">My Moments</h2>
          <p>{Object.keys(collection).length} / {moments.length} moments</p>
        </div>
        <div className="favorite-actions" aria-label="Filter your moments">
          {(["all", 5, 4] as const).map((value) => (
            <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>
              {value === "all" ? "All" : `★${value}`}
            </button>
          ))}
        </div>
        {collected.length ? (
          <ul className="moment-gallery">
            {collected.map((moment) => (
              <li key={moment.slug}>
                <button type="button" disabled={!!busy} onClick={() => {
                  setPull(collection[moment.slug])
                  setShare("")
                  setStatus("")
                }}>
                  <span className="moment-thumb"><MomentImage moment={moment} /></span>
                  <span>{moment.name} · ★{moment.grade}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : <p className="favorite-status">{filter === "all" ? "Your collection is empty." : "No collected moments of this rarity."}</p>}
      </section>
    </>
  )
}
