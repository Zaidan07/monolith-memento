"use client"

import Image from "next/image"
import { useState } from "react"
import { localElementIcon, officialElementIcon } from "../lib/profile-catalog"
import type { Element } from "../lib/trekkers"

export function FavoriteElementIcon({ element }: { element: Element }) {
  const [failed, setFailed] = useState(false)
  const source = (!failed && officialElementIcon(element)) || localElementIcon(element)

  return <Image src={source} width={30} height={30} alt="" unoptimized onError={() => setFailed(true)} />
}
