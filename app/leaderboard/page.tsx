import type { Metadata } from "next"
import Link from "next/link"
import { Trophy } from "lucide-react"
import { TrekkerArt } from "../../components/trekker-art"
import { supabase } from "../../lib/supabase"
import { elements, type Trekker } from "../../lib/trekkers"
import "../favorites.css"
import "./leaderboard.css"

export const metadata: Metadata = { title: "Trekker Leaderboard" }
export const dynamic = "force-dynamic"

const categories = [
  { value: "all", label: "Overall" },
  { value: "favorite-element", label: "Favorite Trekkers" },
  { value: "bingo", label: "Bingo" },
  { value: "top9", label: "Top 9" },
] as const

type LeaderboardRow = Trekker & { vote_count: number; placement: number }

function leaderboardUrl(category: string, element: string) {
  const params = new URLSearchParams()
  if (category !== "all") params.set("category", category)
  if (element !== "all") params.set("element", element)
  const query = params.toString()
  return query ? `/leaderboard?${query}` : "/leaderboard"
}

export default async function LeaderboardPage({ searchParams }: PageProps<"/leaderboard">) {
  const query = await searchParams
  const category = categories.find(({ value }) => value === query.category) ?? categories[0]
  const element = elements.find((value) => value === query.element) ?? "all"
  const result = await supabase?.rpc("get_trekker_leaderboard", {
    vote_category: category.value === "all" ? null : category.value,
    trekker_element: element === "all" ? null : element,
  }).order("placement").order("name").order("id").abortSignal(AbortSignal.timeout(15000))
  const rows = (result?.data ?? []) as LeaderboardRow[]
  const total = rows.reduce((sum, row) => sum + row.vote_count, 0)
  const missingFunction = result?.error?.code === "PGRST202"

  return (
    <main className="shell favorites leaderboard">
      <Link className="favorite-back" href="/#tools">← All tools</Link>
      <div className="leaderboard-title"><h1>Trekker Leaderboard</h1><Trophy aria-hidden="true" /></div>
      <p className="favorite-intro">See which Trekkers have the most votes from the community.</p>

      <nav className="leaderboard-filters" aria-label="Vote category">
        {categories.map(({ value, label }) => (
          <Link key={value} href={leaderboardUrl(value, element)} aria-current={value === category.value ? "true" : undefined}>{label}</Link>
        ))}
      </nav>
      <nav className="leaderboard-filters" aria-label="Trekker element">
        {(["all", ...elements] as const).map((value) => (
          <Link key={value} data-element={value} href={leaderboardUrl(category.value, value)}
            aria-current={value === element ? "true" : undefined}>{value === "all" ? "All elements" : value}</Link>
        ))}
      </nav>

      {!result || result.error ? (
        <div className="favorite-notice leaderboard-notice">
          <p>{missingFunction ? "The leaderboard database function is not installed. Run leaderboard.sql in Supabase." : "The leaderboard is temporarily unavailable."}</p>
          <a href={leaderboardUrl(category.value, element)}>Try again</a>
        </div>
      ) : rows.length === 0 ? (
        <div className="favorite-notice leaderboard-notice">No votes for this selection yet.</div>
      ) : (
        <section className="leaderboard-results" aria-label="Leaderboard results">
          <p className="leaderboard-total">{total.toLocaleString("en-US")} {total === 1 ? "vote" : "votes"}</p>
          <table>
            <thead><tr><th scope="col">Rank</th><th scope="col">Trekker</th><th scope="col">Votes</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} data-element={row.element} data-placement={row.placement}>
                  <td><span className="leaderboard-place">{row.placement}</span></td>
                  <th scope="row">
                    <div className="leaderboard-trekker">
                      <TrekkerArt trekker={row} />
                      <span>{row.name}<small>{row.element}</small></span>
                    </div>
                  </th>
                  <td>{row.vote_count.toLocaleString("en-US")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  )
}
