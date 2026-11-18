import catalog from "../data/profile-catalog.json"
import type { Element } from "./trekkers"

export type ProfileTitle = typeof catalog.titles[number]
export const bundledTitles = catalog.titles
export const honorTitles = catalog.honors

const runes: Record<string, string> = {
  A: "ᚨ", B: "ᛒ", C: "ᚲ", D: "ᛞ", E: "ᛖ", F: "ᚠ", G: "ᚷ", H: "ᚺ",
  I: "ᛁ", J: "ᛃ", K: "ᚲ", L: "ᛚ", M: "ᛗ", N: "ᚾ", O: "ᛟ", P: "ᛈ",
  Q: "ᚲᚹ", R: "ᚱ", S: "ᛊ", T: "ᛏ", U: "ᚢ", V: "ᚹ", W: "ᚹ", X: "ᚲᛊ",
  Y: "ᛃ", Z: "ᛉ",
}

export function guildRunes(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
    .replace(/TH|NG|[A-Z]/g, (value) => value === "TH" ? "ᚦ" : value === "NG" ? "ᛜ" : runes[value])
}

function profileAsset(bucket: string, filename: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")
  return base ? `${base}/storage/v1/object/public/${bucket}/${encodeURIComponent(filename)}` : null
}

export function honorBanner(name: string) {
  const honor = honorTitles.find((entry) => entry.name.toLowerCase() === name.trim().toLowerCase())
  return honor?.banner ? profileAsset("badges", `${honor.id}-banner.png`) : null
}

export function officialElementIcon(element: Element) {
  return profileAsset("elements", `${element.toLowerCase()}.svg`)
}

export function localElementIcon(element: Element) {
  return `/art/elements/${element.toLowerCase()}.svg`
}
