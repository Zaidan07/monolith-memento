"use server"

import { normalizePlayerName } from "../../lib/player-name"

import { getRoster } from "../../lib/favorites-db"
import { supabase } from "../../lib/supabase"
import { readPicks, uuidPattern } from "../../lib/trekkers"

export async function publishFavoritePicks(sessionId: string, input: unknown, mode: "vote" | "share", playerName?: string) {
  if (typeof sessionId !== "string" || !uuidPattern.test(sessionId) || !supabase
    || (mode !== "vote" && mode !== "share")) {
    return { error: "This request could not be processed." }
  }

  try {
    const picks = readPicks(input, await getRoster())
    const ids = Object.values(picks)
    if (!ids.length) return { error: "Pick at least one Trekker first." }

    if (mode === "share") {
      const { data, error } = await supabase.from("shares").insert({
        session_id: sessionId,
        type: "favorite",
        data: { picks, playerName: normalizePlayerName(playerName) },
      }).select("id").abortSignal(AbortSignal.timeout(15000)).single()
      if (error) return { error: "Could not create your share link. Please try again." }
      return { shareId: data.id as string }
    }

    const { error } = await supabase.from("votes").upsert(ids.map((trekkerId) => ({
      session_id: sessionId,
      trekker_id: trekkerId,
      category: "favorite-element",
    })), { onConflict: "session_id,category,trekker_id", ignoreDuplicates: true })
      .abortSignal(AbortSignal.timeout(15000))
    if (error) return { error: "Could not save your votes. Please try again." }
    return { saved: true }
  } catch {
    return { error: "Supabase is temporarily unavailable. Please try again." }
  }
}
