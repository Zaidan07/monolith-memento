"use server"

import { createHash } from "node:crypto"
import { getRoster } from "../../lib/favorites-db"
import { readProfile } from "../../lib/profile"
import { createProjectClient, supabase } from "../../lib/supabase"
import { uuidPattern } from "../../lib/trekkers"

export async function publishProfile(token: string, input: unknown, mode: "save" | "share") {
  if (!supabase || typeof token !== "string" || !uuidPattern.test(token)
    || (mode !== "save" && mode !== "share")) {
    return { error: "This profile could not be processed." }
  }

  try {
    const profile = readProfile(input, await getRoster())
    if (!profile.displayName) return { error: "Enter a display name first." }
    const sessionId = createHash("sha256").update(token).digest("hex")

    profile.game.webUid = sessionId.slice(0, 8)

    if (mode === "share") {
      const { data, error } = await supabase.from("shares").insert({
        session_id: sessionId, type: "profile", data: profile,
      }).select("id").abortSignal(AbortSignal.timeout(15000)).single()
      return error ? { error: "Could not create your share link." } : { shareId: data.id as string }
    }

    const client = createProjectClient({ "x-profile-session": token })
    const { displayName, favoriteTrekkerId, favoriteElement, startedPlaying, favoriteStory, ...answers } = profile
    const { error } = await client.from("profiles").upsert({
      session_id: sessionId, display_name: displayName, favorite_trekker_id: favoriteTrekkerId || null,
      favorite_element: favoriteElement || null, started_playing: startedPlaying || null,
      favorite_story: favoriteStory || null, answers, updated_at: new Date().toISOString(),
    }, { onConflict: "session_id" }).abortSignal(AbortSignal.timeout(15000))
    if (error?.code === "42501") return { error: "Could not save. Check that the profiles.sql policy is installed." }
    return error ? { error: "Could not save your profile. Please try again." } : { saved: true }
  } catch {
    return { error: "Supabase is temporarily unavailable. Please try again." }
  }
}
