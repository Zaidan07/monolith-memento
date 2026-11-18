"use client"

import Image from "next/image"
import { useState } from "react"
import { trekkerImage, type Trekker } from "../lib/trekkers"

export function TrekkerArt({ trekker, size = 96 }: { trekker: Trekker; size?: number }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const src = trekkerImage(trekker.image_url)

  return (
    <span className="trekker-art" aria-hidden="true">
      {src && failedUrl !== src ? (
        <Image src={src} alt="" width={size} height={size} draggable={false} onError={() => setFailedUrl(src)} />
      ) : trekker.name.slice(0, 2).toUpperCase()}
    </span>
  )
}
