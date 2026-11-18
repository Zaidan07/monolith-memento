import type { Metadata } from "next"
import Link from "next/link"
import { FavoriteEditor } from "../../components/favorite-editor"
import { getRoster } from "../../lib/favorites-db"
import "../favorites.css"

export const metadata: Metadata = { title: "Favorite Trekkers" }
export const dynamic = "force-dynamic"

export default async function FavoriteTrekkers() {
  const roster = await getRoster().catch(() => null)

  return (
    <main className="shell favorites">
      <Link className="favorite-back" href="/#tools">← All tools</Link>
      <h1>Favorite Trekkers</h1>
      <p className="favorite-intro">Choose one Trekker for each of Novaria’s six elements.</p>
      {roster?.length ? <FavoriteEditor roster={roster} /> : (
        <div className="favorite-notice">
          <p>{roster ? "The Trekker roster is empty." : "The Trekker roster is temporarily unavailable."}</p>
          <a href="/favorite-trekkers">Reload roster</a>
        </div>
      )}
    </main>
  )
}
