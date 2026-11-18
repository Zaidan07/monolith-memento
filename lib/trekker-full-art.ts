import portraits from "../data/trekker-full-art.json"
import type { Element, Trekker } from "./trekkers"

export const elementStripe: Record<Element, [string, string]> = {
  Ignis: ["#e15a86", "#ffae96"],
  Aqua: ["#5288ef", "#77f0f2"],
  Terra: ["#cd8d4a", "#ffe08b"],
  Ventus: ["#3fa99a", "#a5f3cf"],
  Lux: ["#8b74e8", "#e3ceff"],
  Umbra: ["#a25bdb", "#eeaafa"],
}

export function trekkerFullArt(trekker?: Trekker) {
  if (!trekker) return null
  const id = (portraits as Record<string, number>)[trekker.name]
  return typeof id === "number" ? `/art/trekker-portraits/${id}.webp` : null
}
