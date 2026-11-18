"use server"

import { normalizePlayerName } from "../../lib/player-name"

import { createHash } from "node:crypto"
import { getRoster } from "../../lib/favorites-db"
import { impressionSheetTitle, impressionLimit, readImpression } from "../../lib/impression"
import { createProjectClient, supabase } from "../../lib/supabase"
import { uuidPattern } from "../../lib/trekkers"

export async function publishImpression(token: string, trekkerId: string, input: unknown, mode: "save" | "share", playerName?: string, title?: string) {
  if (!supabase || typeof token !== "string" || !uuidPattern.test(token)
    || typeof trekkerId !== "string" || !uuidPattern.test(trekkerId)
    || (mode !== "save" && mode !== "share")) {
    return { error: "This impression could not be processed." }
  }
  const draft = readImpression(input)
  const first = draft.first.trim()
  const current = draft.current.trim()
  if (!first || !current) return { error: `Enter both impressions, up to ${impressionLimit} characters each.` }

  try {
    const roster = await getRoster()
    if (!roster.some(({ id }) => id === trekkerId)) return { error: "Choose a Trekker from the roster." }
    const sessionId = createHash("sha256").update(token).digest("hex")

    if (mode === "share") {
      const { data, error } = await supabase.from("shares").insert({
        session_id: sessionId, type: "impression", data: { trekkerId, first, current, title: impressionSheetTitle(title), playerName: normalizePlayerName(playerName) },
      }).select("id").abortSignal(AbortSignal.timeout(15000)).single()
      return error ? { error: "Could not create your share link." } : { shareId: data.id as string }
    }

    const client = createProjectClient({ "x-impression-session": token })
    const { error } = await client.from("impressions").upsert({
      session_id: sessionId, trekker_id: trekkerId, first_impression: first,
      current_impression: current, updated_at: new Date().toISOString(),
    }, { onConflict: "session_id,trekker_id" }).abortSignal(AbortSignal.timeout(15000))
    if (error?.code === "42501") return { error: "Could not save. Check that the impressions.sql policy is installed." }
    return error ? { error: "Could not save your impressions. Please try again." } : { saved: true }
  } catch {
    return { error: "Supabase is temporarily unavailable. Please try again." }
  }
}
