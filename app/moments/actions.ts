"use server"

import { findMoment } from "../../lib/moments"
import { normalizePlayerName } from "../../lib/player-name"
import { supabase } from "../../lib/supabase"

export async function saveMoment(slug: string, playerName: string, pulledAt: string) {
  if (typeof slug !== "string" || !findMoment(slug) || typeof pulledAt !== "string") {
    return { error: "Invalid moment." }
  }
  const date = new Date(pulledAt)
  if (!Number.isFinite(date.getTime())) return { error: "Invalid pull date." }
  if (!supabase) return { error: "Supabase is not configured." }
  const { data, error } = await supabase.from("moments").insert({
    trekker_slug: slug, player_name: normalizePlayerName(playerName), pulled_at: date.toISOString(),
  }).select("id").abortSignal(AbortSignal.timeout(12000)).single()
  if (error) return { error: "Could not save this moment. Check that moments.sql has been applied." }
  return { id: data.id as string }
}
