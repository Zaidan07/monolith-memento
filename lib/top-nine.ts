import type { Trekker } from "./trekkers"

export const rankingSize = 9

export function readRanking(value: unknown, roster: Trekker[]): string[] {
  if (!Array.isArray(value)) return []
  const ids = new Set(roster.map(({ id }) => id))
  return [...new Set(value.filter((id): id is string => typeof id === "string" && ids.has(id)))].slice(0, rankingSize)
}

export function moveRank(items: string[], from: number, to: number) {
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0
    || from >= items.length || to >= items.length || from === to) return items
  const next = [...items]
  const [id] = next.splice(from, 1)
  next.splice(to, 0, id)
  return next
}
