"use client"

import { playerNameLimit, readPlayerName, storePlayerName } from "../lib/player-name"

import { useEffect, useState, type DragEvent } from "react"
import { Download, Share2, Vote } from "lucide-react"
import { publishFavoritePicks } from "../app/favorite-trekkers/actions"
import { exportFavoritePng } from "../lib/favorite-png"
import { elements, readPicks, type Element, type Picks, type Trekker } from "../lib/trekkers"
import { getSessionId } from "../lib/browser-session"
import { FavoriteBoard } from "./favorite-board"
import { TrekkerArt } from "./trekker-art"

const draftKey = "stella-sora-pick:favorite-draft"
const dragType = "application/x-stella-trekker"

export function FavoriteEditor({ roster }: { roster: Trekker[] }) {
  const [picks, setPicks] = useState<Picks>({})
  const [active, setActive] = useState<Element | "All">("All")
  const [query, setQuery] = useState("")
  const [message, setMessage] = useState("")
  const [pending, setPending] = useState<"vote" | "share" | "png" | null>(null)
  const [shareUrl, setShareUrl] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      setPicks(readPicks(JSON.parse(localStorage.getItem(draftKey) ?? "null"), roster))
    } catch {
      setPicks({})
    }
    setPlayerName(readPlayerName())
    setReady(true)
  }, [roster])

  function update(next: Picks, notice = "") {
    setPicks(next)
    setShareUrl("")
    try {
      localStorage.setItem(draftKey, JSON.stringify(next))
      setMessage(notice)
    } catch {
      setMessage("This browser could not save your draft.")
    }
  }

  function choose(trekker: Trekker) {
    update({ ...picks, [trekker.element]: trekker.id }, `${trekker.name} selected for ${trekker.element}.`)
  }

  function drop(event: DragEvent, element: Element) {
    event.preventDefault()
    if (pending || !ready) return
    const id = event.dataTransfer.getData(dragType)
    const trekker = roster.find((item) => item.id === id)
    if (!trekker) return
    if (trekker.element !== element) {
      setMessage(`${trekker.name} belongs in the ${trekker.element} slot.`)
      return
    }
    choose(trekker)
  }

  async function run(mode: "vote" | "share" | "png") {
    setPending(mode)
    setMessage("")
    try {
      if (mode === "png") {
        await exportFavoritePng(picks, roster, playerName)
        setMessage("PNG ready.")
        return
      }

      const result = await publishFavoritePicks(getSessionId(), picks, mode, playerName)
      if (result.error) {
        setMessage(result.error)
      } else if (result.shareId) {
        setShareUrl(new URL("/share/" + result.shareId, window.location.origin).href)
        setMessage("Share link ready.")
      } else {
        setMessage("Votes saved. Repeat votes for the same Trekker count once.")
      }
    } catch {
      setMessage("Could not complete this action. Please try again.")
    } finally {
      setPending(null)
    }
  }

  const filtered = roster.filter(({ name, element }) =>
    (active === "All" || element === active) && name.toLowerCase().includes(query.trim().toLowerCase()))
  const filled = Object.keys(picks).length
  const disabled = !ready || !!pending

  return (
    <>
      <fieldset className="favorite-edit-fields" disabled={disabled}>
        <legend className="sr-only">Edit favorite Trekkers</legend>
        <label className="favorite-player-name">
          Your name
          <input type="text" value={playerName} maxLength={playerNameLimit} placeholder="Tulis namamu"
            onChange={(event) => {
              const value = event.target.value
              setPlayerName(value)
              storePlayerName(value)
              setShareUrl("")
            }} />
        </label>
        <section aria-labelledby="favorite-board-title">
          <div className="favorite-heading">
            <h2 id="favorite-board-title">Your picks</h2>
            <p>{filled} / {elements.length} selected</p>
          </div>
          <FavoriteBoard roster={roster} picks={picks} active={active} onSelect={(element) => {
            setActive(element)
            setQuery("")
            document.getElementById("favorite-roster")?.scrollIntoView({ block: "nearest" })
          }} onRemove={(element) => {
            const next = { ...picks }
            delete next[element]
            update(next, `${element} slot cleared.`)
          }} onDrop={drop} />
        </section>
      </fieldset>
      <div className="favorite-actions">
        <button className="favorite-primary" type="button" disabled={disabled || !filled} onClick={() => run("vote")}><Vote size={17} /> {pending === "vote" ? "Saving…" : "Save votes"}</button>
        <button type="button" disabled={disabled || !filled} onClick={() => run("share")}><Share2 size={17} /> {pending === "share" ? "Creating…" : "Create share link"}</button>
        <button type="button" disabled={disabled || !filled} onClick={() => run("png")}><Download size={17} /> {pending === "png" ? "Exporting…" : "Download PNG"}</button>
      </div>
      <p className="favorite-status" role="status">{message}</p>
      {shareUrl && (
        <div className="favorite-share">
          <label htmlFor="favorite-share-url">Public share link</label>
          <input id="favorite-share-url" readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} />
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
      <fieldset className="favorite-edit-fields" disabled={disabled}>
        <legend className="sr-only">Choose from the Trekker roster</legend>
        <section id="favorite-roster" aria-labelledby="favorite-roster-title">
          <div className="favorite-heading">
            <h2 id="favorite-roster-title">Trekker roster</h2>
            <p>Tap a Trekker or drag them to their element slot.</p>
          </div>
          <div className="favorite-filters">
            <div className="element-filters" aria-label="Filter by element">
              {(["All", ...elements] as const).map((element) => (
                <button key={element} type="button" data-element={element} aria-pressed={active === element}
                  onClick={() => setActive(element)}>{element}</button>
              ))}
            </div>
            <label>
              <span className="sr-only">Search Trekkers</span>
              <input type="search" placeholder="Search Trekkers" value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
          </div>
          {filtered.length ? (
            <ul className="favorite-roster">
              {filtered.map((trekker) => (
                <li key={trekker.id} data-element={trekker.element}>
                  <button className="roster-card" type="button" aria-pressed={picks[trekker.element] === trekker.id}
                    draggable={!disabled} onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "copy"
                      event.dataTransfer.setData(dragType, trekker.id)
                    }} onClick={() => choose(trekker)}>
                    <TrekkerArt trekker={trekker} />
                    <strong>{trekker.name}</strong>
                    <span>{trekker.element}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : <p className="favorite-notice">No Trekkers match your search.</p>}
        </section>
      </fieldset>
    </>
  )
}
