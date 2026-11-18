"use server"

import { normalizePlayerName } from "../../lib/player-name"

import { createHash } from "node:crypto"
import { bingoTitle, readBingo, free, side } from "../../lib/bingo"
import { getRoster } from "../../lib/favorites-db"
import { supabase } from "../../lib/supabase"
import { uuidPattern } from "../../lib/trekkers"

export async function publishBingo(sessionId: string, input: unknown, mode: "save" | "share", playerName?: string, title?: string) {
  if (!supabase || typeof sessionId !== "string" || !uuidPattern.test(sessionId)
    || (mode !== "save" && mode !== "share") || !Array.isArray(input) || input.length !== side * side) {
    return { error: "This board could not be processed." }
  }

  try {
    const cells = readBingo(input, await getRoster())
    if (cells.includes(null)) return { error: "Fill all 24 Trekker squares first." }

    if (mode === "share") {
      const { data, error } = await supabase.from("shares").insert({
        session_id: sessionId, type: "bingo", data: { cells, title: bingoTitle(title), playerName: normalizePlayerName(playerName) },
      }).select("id").abortSignal(AbortSignal.timeout(15000)).single()
      return error ? { error: "Could not create your share link." } : { shareId: data.id as string }
    }

    // Identical boards from the same session reuse the same row on retry.
    const digest = createHash("sha256").update(JSON.stringify([sessionId, cells, bingoTitle(title)])).digest("hex")
    const id = `${digest.slice(0, 8)}-${digest.slice(8, 12)}-8${digest.slice(13, 16)}-a${digest.slice(17, 20)}-${digest.slice(20, 32)}`
    const board = await supabase.from("bingo_boards").upsert({
      id, session_id: sessionId, title: bingoTitle(title), cells,
    }, { onConflict: "id", ignoreDuplicates: true }).abortSignal(AbortSignal.timeout(15000))
    if (board.error) return { error: "Could not save your board." }

    const votes = await supabase.from("votes").upsert(cells.filter((cell) => cell !== free).map((trekkerId) => ({
      session_id: sessionId, trekker_id: trekkerId, category: "bingo",
    })), { onConflict: "session_id,category,trekker_id", ignoreDuplicates: true })
      .abortSignal(AbortSignal.timeout(15000))
    return votes.error
      ? { error: "Board saved. Retry Save board to submit your votes." }
      : { saved: true }
  } catch {
    return { error: "Supabase is temporarily unavailable. Please try again." }
  }
}
