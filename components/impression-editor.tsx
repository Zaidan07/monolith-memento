"use client"

import { ImpressionSheet } from "./impression-sheet"
import { defaultSheetTitle } from "../lib/impression"
import { PlayerNameField } from "./player-name-field"

import { readPlayerName } from "../lib/player-name"

import { useEffect, useState } from "react"
import { Download, Save, Share2, ChevronLeft, ChevronRight } from "lucide-react"
import { publishImpression } from "../app/first-impression/actions"
import { getSessionId } from "../lib/browser-session"
import { impressionFields, impressionLimit, readImpression, type Impression } from "../lib/impression"
import { exportImpressionPng } from "../lib/impression-png"
import type { Trekker } from "../lib/trekkers"
import { TrekkerArt } from "./trekker-art"

const draftKey = "stella-sora-pick:impression-drafts"
const sessionKey = "stella-sora-pick:impression-session"
const dragType = "application/x-stella-impression"
const pageSize = 9

export function ImpressionEditor({ roster }: { roster: Trekker[] }) {
  const [sheetTitle, setSheetTitle] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [drafts, setDrafts] = useState<Record<string, Impression>>({})
  const [selected, setSelected] = useState("")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(0)
  const [ready, setReady] = useState(false)
  const [pending, setPending] = useState<"save" | "share" | "png" | null>(null)
  const [message, setMessage] = useState("")
  const [shareUrl, setShareUrl] = useState("")

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(draftKey) ?? "null")
      if (stored && typeof stored === "object") {
        setDrafts(Object.fromEntries(roster.filter(({ id }) => Object.hasOwn(stored, id))
          .map(({ id }) => [id, readImpression(stored[id])])))
      }
    } catch {
      setMessage("This browser could not restore your drafts.")
    }
    setPlayerName(readPlayerName())
    try { setSheetTitle(localStorage.getItem(draftKey + ":title") ?? "") } catch {}
    setReady(true)
  }, [roster])

  const trekker = roster.find(({ id }) => id === selected)
  const entry = readImpression(drafts[selected])
  const disabled = !ready || !!pending
  const complete = !!(trekker && entry.first.trim() && entry.current.trim())
  const filtered = roster.filter(({ name }) => name.toLowerCase().includes(query.trim().toLowerCase()))

  const totalPages = Math.ceil(filtered.length / pageSize)
  const currentPage = Math.min(page, Math.max(0, totalPages - 1))
  const visible = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize)

  function choose(id: string) {
    setSelected(id)
    setShareUrl("")
    setMessage("")
  }

  function update(key: keyof Impression, value: string) {
    const next = { ...drafts, [selected]: { ...entry, [key]: value } }
    setDrafts(next)
    setShareUrl("")
    setMessage("")
    try {
      localStorage.setItem(draftKey, JSON.stringify(next))
    } catch {
      setMessage("This browser could not save your draft.")
    }
  }

  async function run(mode: "save" | "share" | "png") {
    if (!trekker || !complete) return
    const payload = { first: entry.first.trim(), current: entry.current.trim() }
    setMessage("")
    setPending(mode)
    try {
      if (mode === "png") {
        await exportImpressionPng(trekker, payload, playerName, sheetTitle)
        setMessage("PNG ready.")
        return
      }
      const result = await publishImpression(getSessionId(sessionKey), trekker.id, payload, mode, playerName, sheetTitle)
      if (result.error) {
        setMessage(result.error)
      } else if (result.shareId) {
        setShareUrl(new URL("/share/" + result.shareId, window.location.origin).href)
        setMessage("Share link ready.")
      } else {
        setMessage("Impressions saved.")
      }
    } catch {
      setMessage("Could not complete this action. Please try again.")
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="impression-layout">
      <section aria-labelledby="impression-editor-heading">
        <h2 className="impression-heading" id="impression-editor-heading">Your impressions</h2>
        <PlayerNameField disabled={disabled} onEdit={() => { setPlayerName(readPlayerName()); setShareUrl("") }} />
        <label className="favorite-player-name">Sheet title
          <input value={sheetTitle} disabled={disabled} maxLength={80} placeholder={defaultSheetTitle} onChange={(event) => {
            const value = event.target.value
            setSheetTitle(value)
            setShareUrl("")
            try { localStorage.setItem(draftKey + ":title", value) } catch {}
          }} />
        </label>
        <div className="impression-card" onDragOver={(event) => {
          if (!disabled && event.dataTransfer.types.includes(dragType)) event.preventDefault()
        }} onDrop={(event) => {
          if (disabled) return
          const id = event.dataTransfer.getData(dragType)
          if (!roster.some((item) => item.id === id)) return
          event.preventDefault()
          choose(id)
        }}>
          {trekker ? (
            <div className="impression-trekker" data-element={trekker.element}>
              <TrekkerArt trekker={trekker} /><div><h3>{trekker.name}</h3><p>{trekker.element}</p></div>
            </div>
          ) : <p className="impression-empty">Choose a Trekker from the roster or drag a card here.</p>}
          {trekker && (
            <fieldset className="impression-pair favorite-edit-fields" disabled={disabled}>
              <legend className="sr-only">Edit impressions of {trekker.name}</legend>
              {impressionFields.map(({ key, label }) => (
                <div key={key}>
                  <label htmlFor={`impression-${key}`}>{label}</label>
                  <textarea id={`impression-${key}`} maxLength={impressionLimit} rows={5} value={entry[key]}
                    aria-describedby={`impression-count-${key}`} onChange={(event) => update(key, event.target.value)} />
                  <p className="impression-count" id={`impression-count-${key}`}>{entry[key].length} / {impressionLimit}</p>
                </div>
              ))}
            </fieldset>
          )}
        </div>
        <ImpressionSheet trekker={trekker} entry={entry} title={sheetTitle} playerName={playerName} />
        <div className="favorite-actions">
          <button type="button" className="favorite-primary" disabled={disabled || !complete} onClick={() => run("save")}><Save size={16} aria-hidden="true" /> {pending === "save" ? "Saving…" : "Save impressions"}</button>
          <button type="button" disabled={disabled || !complete} onClick={() => run("share")}><Share2 size={16} aria-hidden="true" /> {pending === "share" ? "Creating…" : "Create share link"}</button>
          <button type="button" disabled={disabled || !complete} onClick={() => run("png")}><Download size={16} aria-hidden="true" /> {pending === "png" ? "Exporting…" : "Download PNG"}</button>
        </div>
        <p className="favorite-status" role="status">{message}</p>
        {shareUrl && (
          <div className="favorite-share">
            <label htmlFor="impression-share-url">Public share link</label>
            <input id="impression-share-url" readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} />
            <button type="button" onClick={async () => {
              try {
                await navigator.clipboard.writeText(shareUrl)
                setMessage("Share link copied.")
              } catch {
                setMessage("Select and copy the share link from the field.")
              }
            }}>Copy link</button>
            <a href={shareUrl} target="_blank" rel="noreferrer">Open card ↗</a>
          </div>
        )}
      </section>
      <section aria-labelledby="impression-roster-heading">
        <h2 className="impression-heading" id="impression-roster-heading">Trekker roster</h2>
        <div className="favorite-filters">
          <label><span className="sr-only">Search Trekkers</span>
            <input
              type="search"
              placeholder="Search Trekkers"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(0)
              }}
            />
          </label>
        </div>
        {filtered.length ? (
          <>
            <ul className="favorite-roster impression-roster">
              {visible.map((item) => (
                <li key={item.id} data-element={item.element}>
                  <button className="roster-card" type="button" aria-pressed={selected === item.id} disabled={disabled}
                    draggable={!disabled} onDragStart={(event) => {
                      event.dataTransfer.setData(dragType, item.id)
                      event.dataTransfer.effectAllowed = "copy"
                    }} onClick={() => {
                      choose(item.id)
                      if (window.matchMedia("(max-width: 800px)").matches) {
                        document.getElementById("impression-editor-heading")?.scrollIntoView({ block: "start" })
                      }
                    }}>
                    <TrekkerArt trekker={item} /><strong>{item.name}</strong><span>{item.element}</span>
                  </button>
                </li>
              ))}
            </ul>
            {totalPages > 1 && (
              <div className="favorite-actions" style={{ justifyContent: "center", marginTop: "1rem" }}>
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={disabled || currentPage === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                </button>
                <span>{currentPage + 1} / {totalPages}</span>
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={disabled || currentPage >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                >
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            )}
          </>
        ) : <p className="favorite-notice">No Trekkers match your search.</p>}
      </section>
    </div>
  )
}