import pool from "../data/moments.json"
import type { Element } from "./trekkers"

export type Moment = { slug: string; name: string; element: Element; grade: 4 | 5 }
export type MomentPull = { slug: string; pulledAt: string; playerName: string }

export const moments = pool as Moment[]
export const rareMomentChance = .3
const rare = moments.filter(({ grade }) => grade === 5)
const common = moments.filter(({ grade }) => grade === 4)

export function drawMoment(random = Math.random) {
  const group = random() < rareMomentChance ? rare : common
  return group[Math.floor(random() * group.length)]
}

export function findMoment(slug: string) {
  return moments.find((moment) => moment.slug === slug)
}

export function momentImage(slug: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")
  return base ? `${base}/storage/v1/object/public/moments/${slug}.png` : null
}

export function formatMomentDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "Asia/Jakarta" }).format(new Date(date))
}
