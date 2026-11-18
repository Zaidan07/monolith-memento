import type { Metadata } from "next"
import Link from "next/link"
import { TopNineEditor } from "../../components/top-nine-editor"
import { getRoster } from "../../lib/favorites-db"
import "../favorites.css"
import "./top-nine.css"

export const metadata: Metadata = { title: "Top 9 Trekkers" }
export const dynamic = "force-dynamic"

export default async function TopNinePage() {
  const roster = await getRoster().catch(() => null)
  return (
    <main className="shell favorites">
      <Link className="favorite-back" href="/#tools">← All tools</Link>
      <h1>Top 9 Trekkers</h1>
      <p className="favorite-intro">Choose your favorite Trekkers and put them in order from 1 to 9.</p>
      {roster?.length ? <TopNineEditor roster={roster} /> : (
        <div className="favorite-notice">
          <p>{roster ? "The Trekker roster is empty." : "The Trekker roster is temporarily unavailable."}</p>
          <a href="/top-nine">Reload roster</a>
        </div>
      )}
    </main>
  )
}
