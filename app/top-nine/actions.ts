"use server"

import { normalizePlayerName } from "../../lib/player-name"

import { getRoster } from "../../lib/favorites-db"
import { supabase } from "../../lib/supabase"
import { rankingSize, readRanking } from "../../lib/top-nine"
import { uuidPattern } from "../../lib/trekkers"

export async function publishRanking(sessionId: string, input: unknown, mode: "save" | "share", playerName?: string) {
  if (!supabase || typeof sessionId !== "string" || !uuidPattern.test(sessionId)
    || !Array.isArray(input) || input.length !== rankingSize || (mode !== "save" && mode !== "share")) {
    return { error: "This ranking could not be processed." }
  }

  try {
    const items = readRanking(input, await getRoster())
    if (items.length !== rankingSize) return { error: "Choose nine different Trekkers first." }

    if (mode === "share") {
      const { data, error } = await supabase.from("shares").insert({
        session_id: sessionId, type: "top9", data: { items, playerName: normalizePlayerName(playerName) },
      }).select("id").abortSignal(AbortSignal.timeout(15000)).single()
      return error ? { error: "Could not create your share link." } : { shareId: data.id as string }
    }

    const ranking = await supabase.from("rankings").upsert({
      session_id: sessionId, type: "top9", items, updated_at: new Date().toISOString(),
    }, { onConflict: "session_id,type" }).abortSignal(AbortSignal.timeout(15000))
    if (ranking.error) return { error: "Could not save your ranking. Please try again." }

    const votes = await supabase.from("votes").upsert(items.map((trekkerId) => ({
      session_id: sessionId, trekker_id: trekkerId, category: "top9",
    })), { onConflict: "session_id,category,trekker_id", ignoreDuplicates: true })
      .abortSignal(AbortSignal.timeout(15000))
    return votes.error
      ? { error: "Ranking saved. Retry Save ranking to submit your votes." }
      : { saved: true }
  } catch {
    return { error: "Supabase is temporarily unavailable. Please try again." }
  }
}
