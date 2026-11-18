export const impressionLimit = 240
export const impressionFields = [
  { key: "first", label: "First impression" },
  { key: "current", label: "Impression now" },
] as const

export type Impression = { first: string; current: string }

export function readImpression(value: unknown): Impression {
  const entry = value && typeof value === "object" ? value as Partial<Impression> : {}
  return {
    first: typeof entry.first === "string" ? entry.first.slice(0, impressionLimit) : "",
    current: typeof entry.current === "string" ? entry.current.slice(0, impressionLimit) : "",
  }
}

export const defaultSheetTitle = "My First Impressions vs. Now"

export function impressionSheetTitle(value: unknown) {
  return (typeof value === "string" ? value.trim().slice(0, 80) : "") || defaultSheetTitle
}
