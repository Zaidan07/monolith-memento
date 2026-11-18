import type { Metadata } from "next"
import Link from "next/link"
import { MomentEditor } from "../../components/moment-editor"
import "../favorites.css"
import "./moments.css"

export const metadata: Metadata = { title: "Moment with YOU." }

export default function MomentsPage() {
  return (
    <main className="shell favorites moments-page">
      <Link className="favorite-back" href="/#tools">← All tools</Link>
      <h1>Moment with YOU.</h1>
      <p className="favorite-intro">Pull a Trekker's Memory Snapshot and add it to your collection.</p>
      <MomentEditor />
    </main>
  )
}
