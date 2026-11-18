import { playerResultTitle } from "../../../lib/player-name"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { GuildProfileCard } from "../../../components/guild-profile-card"
import { NovariaCard } from "../../../components/novaria-card"
import { readProfile } from "../../../lib/profile"
import { ImpressionSheet } from "../../../components/impression-sheet"
import { readImpression } from "../../../lib/impression"
import { TopNineBoard } from "../../../components/top-nine-board"
import { readRanking } from "../../../lib/top-nine"
import { BingoBoard } from "../../../components/bingo-board"
import { bingoTitle, readBingo } from "../../../lib/bingo"
import { FavoriteResultCard } from "../../../components/favorite-result-card"
import { normalizePlayerName } from "../../../lib/player-name"
import { getRoster } from "../../../lib/favorites-db"
import { supabase } from "../../../lib/supabase"
import { readPicks, uuidPattern } from "../../../lib/trekkers"
import "../../favorites.css"
import "../../bingo/bingo.css"
import "../../top-nine/top-nine.css"
import "../../first-impression/impression.css"
import "../../profile/profile.css"

export const metadata: Metadata = { title: "Shared Trekker Board" }
export const dynamic = "force-dynamic"

export default async function SharedBoard({ params }: PageProps<"/share/[id]">) {
  const { id } = await params
  if (!uuidPattern.test(id)) notFound()

  const result = await supabase?.from("shares").select("type,data").eq("id", id)
    .in("type", ["favorite", "bingo", "top9", "impression", "profile"]).abortSignal(AbortSignal.timeout(15000)).maybeSingle()
  if (result && !result.error && !result.data) notFound()

  const roster = result?.data ? await getRoster().catch(() => null) : null
  const bingo = result?.data?.type === "bingo"
  const topNine = result?.data?.type === "top9"
  const impression = result?.data?.type === "impression"
  const impressionTrekker = impression ? roster?.find(({ id }) => id === result.data.data?.trekkerId) : null
  const profile = result?.data?.type === "profile"
  const title = profile ? "Shared Novaria Profile" : impression ? "Shared First Impression vs Now"
    : topNine ? "Shared Top 9 Trekkers" : bingo ? "Shared Trekker Bingo" : "Shared Favorite Trekkers"
  const toolPath = profile ? "/profile" : impression ? "/first-impression" : topNine ? "/top-nine" : bingo ? "/bingo" : "/favorite-trekkers"
  const sharedProfile = profile && roster ? readProfile(result.data.data, roster) : null
  const favorite = result?.data?.type === "favorite" && roster
  const playerName = profile ? "" : normalizePlayerName(result?.data?.data?.playerName)
  return (
    <main className={profile ? "shell favorites novaria-game-page" : "shell favorites"}>
      <Link className="favorite-back" href="/">← Home</Link>
      {!favorite && !impressionTrekker && <h1 className="shared-board-title">{bingo ? bingoTitle(result.data.data?.title) : playerResultTitle(topNine ? "Favorite Trekkers TOP 9" : title, playerName)}</h1>}
      {sharedProfile && roster ? (
        <div className="novaria-shared"><GuildProfileCard profile={sharedProfile} roster={roster} /><section className="guild-about"><h2>About</h2><NovariaCard roster={roster} profile={sharedProfile} /></section></div>
      ) : impression ? (
        impressionTrekker ? (
          <div className="impression-shared"><ImpressionSheet shared trekker={impressionTrekker} entry={readImpression(result.data.data)} title={result.data.data?.title} playerName={playerName} /></div>
        ) : <p className="favorite-intro">This card is temporarily unavailable.</p>
      ) : roster && topNine ? (
        <div className="top-nine-shared"><TopNineBoard roster={roster} items={readRanking(result.data.data?.items, roster)} /></div>
      ) : roster && bingo ? (
        <div className="bingo-shared"><BingoBoard roster={roster} cells={readBingo(result.data.data?.cells, roster)} />{playerName && <p>Created by {playerName}</p>}</div>
      ) : favorite ? (
        <FavoriteResultCard roster={roster} picks={readPicks(result.data.data?.picks, roster)} playerName={playerName} />
      ) : (
        <p className="favorite-intro">This board is temporarily unavailable. Please try again.</p>
      )}
      <Link className="favorite-primary favorite-create" href={toolPath}>{profile ? "Create your own profile" : "Make your own picks"}</Link>
    </main>
  )
}
