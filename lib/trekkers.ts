export const elements = ["Ignis", "Aqua", "Terra", "Ventus", "Lux", "Umbra"] as const
export type Element = typeof elements[number]
export type Trekker = { id: string; name: string; element: Element; image_url: string | null }
export type Picks = Partial<Record<Element, string>>
export const uuidPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i

export function readPicks(value: unknown, roster: Trekker[]): Picks {
  const picks: Picks = {}
  if (!value || typeof value !== "object") return picks
  for (const { id, element } of roster) {
    if ((value as Record<string, unknown>)[element] === id) picks[element] = id
  }
  return picks
}

export function trekkerImage(url: string | null) {
  if (!url) return null
  try {
    const asset = new URL(url)
    if (asset.protocol !== "https:" || asset.port || asset.search || asset.username || asset.password) return null
    if (asset.hostname === "api.ennead.cc" && asset.pathname.startsWith("/stella/assets/")) return asset.href
    if (asset.origin === process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") && asset.pathname.startsWith("/storage/v1/object/public/trekkers/")) return asset.href
  } catch {
    return null
  }
  return null
}
