import type { Metadata } from "next"
import Link from "next/link"
import { BingoEditor } from "../../components/bingo-editor"
import { getRoster } from "../../lib/favorites-db"
import "../favorites.css"
import "./bingo.css"

export const metadata: Metadata = { title: "Trekker Bingo" }
export const dynamic = "force-dynamic"

export default async function BingoPage() {
  const roster = await getRoster().catch(() => null)
  return (
    <main className="shell favorites">
      <Link className="favorite-back" href="/#tools">← All tools</Link>
      <h1>Trekker Bingo</h1>
      <p className="favorite-intro">Pick 24 different Trekkers for your bingo board. The center is a free square.</p>
      {roster?.length ? <BingoEditor roster={roster} /> : (
        <div className="favorite-notice">
          <p>{roster ? "The Trekker roster is empty." : "The Trekker roster is temporarily unavailable."}</p>
          <a href="/bingo">Reload roster</a>
        </div>
      )}
    </main>
  )
}
