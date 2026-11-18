"use client"

import { PlayerNameField } from "./player-name-field"

import { readPlayerName } from "../lib/player-name"

import { useEffect, useState, type DragEvent } from "react"
import { Download, Save, Share2, ChevronLeft, ChevronRight } from "lucide-react"
import { publishRanking } from "../app/top-nine/actions"
import { getSessionId } from "../lib/browser-session"
import { moveRank, rankingSize, readRanking } from "../lib/top-nine"
import { exportTopNinePng } from "../lib/top-nine-png"
import type { Trekker } from "../lib/trekkers"
import { TopNineBoard } from "./top-nine-board"
import { TrekkerArt } from "./trekker-art"

const draftKey = "stella-sora-pick:top-nine-draft"
const dragType = "application/x-stella-top-nine"
const pageSize = 9

export function TopNineEditor({ roster }: { roster: Trekker[] }) {
  const [items, setItems] = useState<string[]>([])
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(0)
  const [ready, setReady] = useState(false)
  const [pending, setPending] = useState<"save" | "share" | "png" | null>(null)
  const [message, setMessage] = useState("")
  const [shareUrl, setShareUrl] = useState("")

  useEffect(() => {
    try {
      setItems(readRanking(JSON.parse(localStorage.getItem(draftKey) ?? "null"), roster))
    } catch {
      setMessage("This browser could not restore your draft.")
    }
    setReady(true)
  }, [roster])

  function update(next: string[], notice: string) {
    setItems(next)
    setShareUrl("")
    try {
      localStorage.setItem(draftKey, JSON.stringify(next))
      setMessage(notice)
    } catch {
      setMessage("This browser could not save your draft.")
    }
  }

  function move(from: number, to: number) {
    const next = moveRank(items, from, to)
    if (next !== items) update(next, `Moved to rank ${to + 1}.`)
  }

  function add(trekker: Trekker, index = items.length) {
    if (items.includes(trekker.id) || items.length >= rankingSize) return
    const next = [...items]
    const rank = Math.min(index, items.length)
    next.splice(rank, 0, trekker.id)
    update(next, `${trekker.name} added at rank ${rank + 1}.`)
  }

  function drag(event: DragEvent, id: string) {
    event.dataTransfer.setData(dragType, id)
    event.dataTransfer.effectAllowed = "move"
  }

  async function run(mode: "save" | "share" | "png") {
    setMessage("")
    setPending(mode)
    try {
      if (mode === "png") {
        await exportTopNinePng(items, roster, readPlayerName())
        setMessage("PNG ready.")
        return
      }
      const result = await publishRanking(getSessionId(), items, mode, readPlayerName())
      if (result.error) {
        setMessage(result.error)
      } else if (result.shareId) {
        setShareUrl(new URL("/share/" + result.shareId, window.location.origin).href)
        setMessage("Share link ready.")
      } else {
        setMessage("Ranking and votes saved.")
      }
    } catch {
      setMessage("Could not complete this action. Please try again.")
    } finally {
      setPending(null)
    }
  }

  const disabled = !ready || !!pending
  const complete = items.length === rankingSize
  const filtered = roster.filter(({ name }) => name.toLowerCase().includes(query.trim().toLowerCase()))

  const totalPages = Math.ceil(filtered.length / pageSize)
  const currentPage = Math.min(page, Math.max(0, totalPages - 1))
  const visible = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize)

  return (
    <div className="top-nine-layout">
      <section aria-labelledby="top-nine-board-heading">
        <div className="favorite-heading">
          <h2 id="top-nine-board-heading">Your ranking</h2>
          <p>{items.length} / {rankingSize} selected</p>
        </div>
        <PlayerNameField disabled={disabled} onEdit={() => setShareUrl("")} />
        <fieldset className="favorite-edit-fields" disabled={disabled}>
          <legend className="sr-only">Edit your ranking</legend>
          <TopNineBoard items={items} roster={roster} onMove={move}
            onRemove={(index) => update(items.filter((_, rank) => rank !== index), "Trekker removed.")}
            onDrag={disabled ? undefined : drag}
            onDrop={disabled ? undefined : (event, index) => {
              event.preventDefault()
              const id = event.dataTransfer.getData(dragType)
              const from = items.indexOf(id)
              if (from >= 0) {
                move(from, Math.min(index, items.length - 1))
                return
              }
              const trekker = roster.find((item) => item.id === id)
              if (trekker) add(trekker, index)
            }} />
        </fieldset>
        <div className="favorite-actions">
          <button type="button" className="favorite-primary" disabled={disabled || !complete} onClick={() => run("save")}><Save size={16} aria-hidden="true" /> {pending === "save" ? "Saving…" : "Save ranking"}</button>
          <button type="button" disabled={disabled || !complete} onClick={() => run("share")}><Share2 size={16} aria-hidden="true" /> {pending === "share" ? "Creating…" : "Create share link"}</button>
          <button type="button" disabled={disabled || !items.length} onClick={() => run("png")}><Download size={16} aria-hidden="true" /> {pending === "png" ? "Exporting…" : "Download PNG"}</button>
        </div>
        <p className="favorite-status" role="status">{message}</p>
        {shareUrl && (
          <div className="favorite-share">
            <label htmlFor="top-nine-share-url">Public share link</label>
            <input id="top-nine-share-url" readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} />
            <button type="button" onClick={async () => {
              try {
                await navigator.clipboard.writeText(shareUrl)
                setMessage("Share link copied.")
              } catch {
                setMessage("Select and copy the share link from the field.")
              }
            }}>Copy link</button>
            <a href={shareUrl} target="_blank" rel="noreferrer">Open ranking ↗</a>
          </div>
        )}
      </section>
      <section aria-labelledby="top-nine-roster-heading">
        <div className="favorite-heading">
          <h2 id="top-nine-roster-heading">Trekker roster</h2>
          <p>Tap to add, then use the arrows or drag to reorder.</p>
        </div>
        <fieldset className="favorite-edit-fields" disabled={disabled}>
          <legend className="sr-only">Choose Trekkers</legend>
          <div className="favorite-filters">
            <label>
              <span className="sr-only">Search Trekkers</span>
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
              <ul className="favorite-roster top-nine-roster">
                {visible.map((trekker) => {
                  const picked = items.includes(trekker.id)
                  return <li key={trekker.id} data-element={trekker.element}>
                    <button className="roster-card" type="button" aria-pressed={picked} disabled={picked || complete}
                      draggable={!disabled && !picked && !complete}
                      onClick={() => add(trekker)} onDragStart={(event) => drag(event, trekker.id)}>
                      <TrekkerArt trekker={trekker} />
                      <strong>{trekker.name}</strong>
                      <span>{trekker.element}</span>
                    </button>
                  </li>
                })}
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
        </fieldset>
      </section>
    </div>
  )
}