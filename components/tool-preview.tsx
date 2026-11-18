"use client"

import { useState } from "react"
import previews from "../data/disc-previews.json"

export type PreviewKind = keyof typeof previews

export function ToolPreview({ kind }: { kind: PreviewKind }) {
  const [failed, setFailed] = useState(false)
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")
  const { file } = previews[kind]
  const source = !failed && base
    ? `${base}/storage/v1/object/public/discs/${file}.png`
    : `/art/discs/${file}.webp`

  return (
    <div className={`tool-preview tool-preview-disc tool-preview-${kind}`} aria-hidden="true">
      <img src={source} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} />
    </div>
  )
}
