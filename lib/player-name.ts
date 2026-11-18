const storageKey = "stella-sora-pick:player-name"
export const playerNameLimit = 40

export function normalizePlayerName(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, playerNameLimit).trimEnd() : ""
}

export function readPlayerName() {
  try {
    return normalizePlayerName(localStorage.getItem(storageKey))
  } catch {
    return ""
  }
}

export function storePlayerName(value: string) {
  try {
    localStorage.setItem(storageKey, normalizePlayerName(value))
  } catch {
    // The editor can still use its in-memory value.
  }
}

export function playerResultTitle(title: string, value: unknown) {
  const name = normalizePlayerName(value)
  return name ? `${name}'s ${title}` : title
}
