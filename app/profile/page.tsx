import type { Metadata } from "next"
import Link from "next/link"
import { NovariaEditor } from "../../components/novaria-editor"
import { getProfileTitles } from "../../lib/profile-catalog-db"
import { getRoster } from "../../lib/favorites-db"
import "../favorites.css"
import "./profile.css"

export const metadata: Metadata = { title: "Novaria Profile" }
export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  const [roster, titles] = await Promise.all([getRoster().catch(() => null), getProfileTitles()])
  return (
    <main className="shell favorites novaria-game-page">
      <Link className="favorite-back" href="/#tools">← All tools</Link>
      <h1>Novaria Profile</h1>
      <p className="favorite-intro">Tell your Stella Sora story in nine answers.</p>
      {roster ? <NovariaEditor roster={roster} titles={titles} /> : (
        <div className="favorite-notice">
          <p>The Trekker roster is temporarily unavailable.</p>
          <a href="/profile">Reload roster</a>
        </div>
      )}
    </main>
  )
}
