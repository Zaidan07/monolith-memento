"use client"

import Image from "next/image"
import { useState } from "react"
import { formatMomentDate, momentImage, type Moment, type MomentPull } from "../lib/moments"
import { playerResultTitle } from "../lib/player-name"
import { FavoriteElementIcon } from "./favorite-element-icon"

export function MomentImage({ moment, preview = false }: { moment: Moment; preview?: boolean }) {
  const source = momentImage(moment.slug)
  const [failed, setFailed] = useState(false)
  const url = (!failed && source) || (preview && moment.slug === "leafia" ? "/art/leafia-memory-preview.webp" : null)
  return url
    ? <Image src={url} alt={`${moment.name} Memory Snapshot`} fill unoptimized onError={() => setFailed(true)} />
    : <span className="moment-image-empty">Snapshot unavailable</span>
}

export function MomentCard({ moment, pull }: { moment: Moment; pull: MomentPull }) {
  return (
    <article className="moment-card">
      <MomentImage key={moment.slug} moment={moment} />
      <div className="moment-overlay">
        <p className="moment-label">Moment with YOU.</p>
        {moment.grade === 5 && <span className="moment-rare">★5 Rare Moment</span>}
        <div className="moment-caption">
          <h2>{playerResultTitle(`Moment with ${moment.name}`, pull.playerName)}</h2>
          <p><FavoriteElementIcon element={moment.element} /> {moment.element} · <time dateTime={pull.pulledAt}>{formatMomentDate(pull.pulledAt)}</time></p>
        </div>
      </div>
    </article>
  )
}
