import type { Trekker } from "./trekkers"

export const side = 5
export const center = 12
export const free = "FREE"
export type BingoCells = (string | null)[]

export function readBingo(value: unknown, roster: Trekker[]): BingoCells {
  const ids = new Set(roster.map(({ id }) => id))
  const seen = new Set<string>()
  return Array.from({ length: side * side }, (_, index) => {
    if (index === center) return free
    const id = Array.isArray(value) ? value[index] : null
    if (typeof id !== "string" || !ids.has(id) || seen.has(id)) return null
    seen.add(id)
    return id
  })
}

export function placeTrekker(cells: BingoCells, index: number, id: string): BingoCells {
  if (!Number.isInteger(index) || index < 0 || index >= cells.length || index === center || id === free) return cells
  const next = [...cells]
  const oldIndex = next.indexOf(id)
  if (oldIndex >= 0) next[oldIndex] = next[index]
  next[index] = id
  return next
}

export const defaultBingoTitle = "My Trekker Bingo"

export function bingoTitle(value: unknown) {
  return (typeof value === "string" ? value.trim().slice(0, 80) : "") || defaultBingoTitle
}

export function randomBingo(roster: Trekker[]): BingoCells {
  const ids = [...new Set(roster.map(({ id }) => id))]
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const candidate = ids[i]
    ids[i] = ids[j]
    ids[j] = candidate
  }
  const cells: BingoCells = ids.slice(0, side * side - 1)
  cells.splice(center, 0, free)
  return readBingo(cells, roster)
}
