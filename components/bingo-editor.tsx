"use client"

import { readPlayerName } from "../lib/player-name"

import { useEffect, useState, type DragEvent } from "react"
import { Download, Save, Share2, X, ChevronLeft, ChevronRight } from "lucide-react"
import { publishBingo } from "../app/bingo/actions"
import { exportBingoPng } from "../lib/bingo-png"
import { bingoTitle, defaultBingoTitle, randomBingo, center, free, placeTrekker, readBingo, side, type BingoCells } from "../lib/bingo"
import { getSessionId } from "../lib/browser-session"
import { elements, type Element, type Trekker } from "../lib/trekkers"
import { BingoBoard } from "./bingo-board"
import { TrekkerArt } from "./trekker-art"

const draftKey = "stella-sora-pick:bingo-draft"
const dragType = "application/x-stella-bingo-trekker"
const pageSize = 9

export function BingoEditor({ roster }: { roster: Trekker[] }) {
  const [title, setTitle] = useState("")
  const [playing, setPlaying] = useState(false)
  const [marks, setMarks] = useState<number[]>([])
  const [cells, setCells] = useState(() => readBingo(null, roster))
  const [selected, setSelected] = useState(0)
  const [query, setQuery] = useState("")
  const [element, setElement] = useState<Element | "All">("All")
  const [page, setPage] = useState(0)
  const [ready, setReady] = useState(false)
  const [pending, setPending] = useState<"save" | "share" | "png" | null>(null)
  const [message, setMessage] = useState("")
  const [shareUrl, setShareUrl] = useState("")

  useEffect(() => {
    let draft = readBingo(null, roster)
    try {
      draft = readBingo(JSON.parse(localStorage.getItem(draftKey) ?? "null"), roster)
    } catch {
      setMessage("This browser could not restore your draft.")
    }
    setCells(draft)
    setSelected(Math.max(0, draft.indexOf(null)))
    try { setTitle(localStorage.getItem(draftKey + ":title") ?? "") } catch {}
    setReady(true)
  }, [roster])

  function update(next: BingoCells, notice: string) {
    setCells(next)
    setMarks([])
    setShareUrl("")
    try {
      localStorage.setItem(draftKey, JSON.stringify(next))
      setMessage(notice)
    } catch {
      setMessage("This browser could not save your draft.")
    }
  }

  function place(index: number, trekker: Trekker) {
    const next = placeTrekker(cells, index, trekker.id)
    update(next, `${trekker.name} placed in row ${Math.floor(index / side) + 1}, column ${index % side + 1}.`)
    const nextEmpty = next.findIndex((id, slot) => slot > index && id === null)
    const firstEmpty = next.indexOf(null)
    setSelected(nextEmpty >= 0 ? nextEmpty : firstEmpty >= 0 ? firstEmpty : index)
  }

  function startDrag(event: DragEvent, id: string) {
    if (!ready || pending) {
      event.preventDefault()
      return
    }
    event.dataTransfer.setData(dragType, id)
    event.dataTransfer.effectAllowed = "move"
  }

  async function run(mode: "save" | "share" | "png") {
    setMessage("")
    setPending(mode)
    try {
      if (mode === "png") {
        await exportBingoPng(cells, roster, readPlayerName(), title)
        setMessage("PNG ready.")
        return
      }
      const result = await publishBingo(getSessionId(), cells, mode, readPlayerName(), title)
      if (result.error) {
        setMessage(result.error)
      } else if (result.shareId) {
        setShareUrl(new URL("/share/" + result.shareId, window.location.origin).href)
        setMessage("Share link ready.")
      } else {
        setMessage("Board and votes saved.")
      }
    } catch {
      setMessage("Could not complete this action. Please try again.")
    } finally {
      setPending(null)
    }
  }

  const disabled = !ready || !!pending
  const filled = cells.filter((id) => id && id !== free).length
  const filtered = roster.filter((trekker) =>
    (element === "All" || trekker.element === element)
    && trekker.name.toLowerCase().includes(query.trim().toLowerCase()))

  const totalPages = Math.ceil(filtered.length / pageSize)
  const currentPage = Math.min(page, Math.max(0, totalPages - 1))
  const visible = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize)

  return (
    <div className="bingo-layout">
      <section className="bingo-workspace" aria-labelledby="bingo-board-heading">
        <div className="favorite-heading">
          <h2 id="bingo-board-heading">{bingoTitle(title)}</h2>
          <p>{filled} / 24 selected</p>
        </div>
        <fieldset className="favorite-edit-fields" disabled={disabled}>
          <legend className="sr-only">Edit bingo squares</legend>
          <label className="favorite-player-name">Bingo title
            <input value={title} placeholder={defaultBingoTitle} maxLength={80} onChange={(event) => {
              const value = event.target.value
              setTitle(value)
              setShareUrl("")
              try { localStorage.setItem(draftKey + ":title", value) } catch {}
            }} />
          </label>
          <BingoBoard cells={cells} roster={roster} selected={playing ? undefined : selected} marks={playing ? marks : undefined}
            onSelect={playing ? (index) => setMarks((old) => old.includes(index) ? old.filter((item) => item !== index) : [...old, index]) : setSelected} onDrag={playing ? undefined : startDrag} onDrop={playing ? undefined : (event, index) => {
              event.preventDefault()
              if (disabled || index === center) return
              const trekker = roster.find(({ id }) => id === event.dataTransfer.getData(dragType))
              if (trekker) place(index, trekker)
            }} />
        </fieldset>
        <div className="favorite-actions">
          <button type="button" disabled={disabled || playing || roster.length < 24} onClick={() => update(randomBingo(roster), "24 Trekkers selected.")}>Random fill</button>
          <button type="button" disabled={disabled || (!playing && filled !== 24)} aria-pressed={playing}
            onClick={() => setPlaying((value) => !value)}>{playing ? "Edit board" : "Play"}</button>
          <button type="button" disabled={disabled || playing || !cells[selected]} onClick={() => {
            const next = [...cells]
            next[selected] = null
            update(next, "Selected square cleared.")
          }}><X size={16} aria-hidden="true" /> Clear square</button>
          <button type="button" className="favorite-primary" disabled={disabled || filled !== 24} onClick={() => run("save")}><Save size={16} aria-hidden="true" /> {pending === "save" ? "Saving…" : "Save board"}</button>
          <button type="button" disabled={disabled || filled !== 24} onClick={() => run("share")}><Share2 size={16} aria-hidden="true" /> {pending === "share" ? "Creating…" : "Create share link"}</button>
          <button type="button" disabled={disabled || !filled} onClick={() => run("png")}><Download size={16} aria-hidden="true" /> {pending === "png" ? "Exporting…" : "Download PNG"}</button>
        </div>
        <p className="favorite-status" role="status">{message}</p>
        {shareUrl && (
          <div className="favorite-share">
            <label htmlFor="bingo-share-url">Public share link</label>
            <input id="bingo-share-url" readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} />
            <button type="button" onClick={async () => {
              try {
                await navigator.clipboard.writeText(shareUrl)
                setMessage("Share link copied.")
              } catch {
                setMessage("Select and copy the share link from the field.")
              }
            }}>Copy link</button>
            <a href={shareUrl} target="_blank" rel="noreferrer">Open board ↗</a>
          </div>
        )}
      </section>
      <section hidden={playing} className="bingo-picker" aria-labelledby="bingo-roster-heading">
        <div className="favorite-heading">
          <h2 id="bingo-roster-heading">Trekker roster</h2>
          <p>Choose a square and tap a card, or drag a card onto the board.</p>
        </div>
        <fieldset className="favorite-edit-fields" disabled={disabled}>
          <legend className="sr-only">Choose a Trekker</legend>
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
            <div className="element-filters" aria-label="Filter by element">
              {(["All", ...elements] as const).map((filter) => (
                <button
                  type="button"
                  key={filter}
                  data-element={filter}
                  aria-pressed={filter === element}
                  onClick={() => {
                    setElement(filter)
                    setPage(0)
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          {filtered.length ? (
            <>
              <ul className="favorite-roster bingo-roster">
                {visible.map((trekker) => (
                  <li key={trekker.id} data-element={trekker.element}>
                    <button className="roster-card" type="button" aria-pressed={cells.includes(trekker.id)}
                      draggable={!disabled} onDragStart={(event) => startDrag(event, trekker.id)} onClick={() => place(selected, trekker)}>
                      <TrekkerArt trekker={trekker} />
                      <strong>{trekker.name}</strong>
                      <span>{trekker.element}</span>
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
        </fieldset>
      </section>
    </div>
  )
}