import type { Metadata } from "next"
import Link from "next/link"
import { ImpressionEditor } from "../../components/impression-editor"
import { getRoster } from "../../lib/favorites-db"
import "../favorites.css"
import "./impression.css"

export const metadata: Metadata = { title: "First Impression vs Now" }
export const dynamic = "force-dynamic"

export default async function FirstImpressionPage() {
  const roster = await getRoster().catch(() => null)
  return (
    <main className="shell favorites">
      <Link className="favorite-back" href="/#tools">← All tools</Link>
      <h1>First Impression vs Now</h1>
      <p className="favorite-intro">Compare what you thought when you first met a Trekker with how you feel now.</p>
      {roster?.length ? <ImpressionEditor roster={roster} /> : (
        <div className="favorite-notice">
          <p>{roster ? "The Trekker roster is empty." : "The Trekker roster is temporarily unavailable."}</p>
          <a href="/first-impression">Reload roster</a>
        </div>
      )}
    </main>
  )
}
