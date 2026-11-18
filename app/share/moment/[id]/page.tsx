import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MomentCard } from "../../../../components/moment-card"
import { findMoment } from "../../../../lib/moments"
import { supabase } from "../../../../lib/supabase"
import { uuidPattern } from "../../../../lib/trekkers"
import "../../../favorites.css"
import "../../../moments/moments.css"

export const metadata: Metadata = { title: "Shared Memory Snapshot" }
export const dynamic = "force-dynamic"

export default async function SharedMomentPage({ params }: PageProps<"/share/moment/[id]">) {
  const { id } = await params
  if (!uuidPattern.test(id)) notFound()
  const result = await supabase?.from("moments").select("trekker_slug,player_name,pulled_at").eq("id", id)
    .abortSignal(AbortSignal.timeout(12000)).maybeSingle()
  if (!result || result.error) {
    return <main className="shell favorites moments-page"><p>Shared moment is temporarily unavailable.</p><Link className="favorite-back" href="/moments">← Moments</Link></main>
  }
  const row = result.data
  const moment = row && findMoment(row.trekker_slug)
  if (!moment) notFound()
  return (
    <main className="shell favorites moments-page">
      <Link className="favorite-back" href="/moments">← Pull your own moment</Link>
      <h1>Shared Memory Snapshot</h1>
      <MomentCard moment={moment} pull={{ slug: moment.slug, pulledAt: row.pulled_at, playerName: row.player_name }} />
    </main>
  )
}
