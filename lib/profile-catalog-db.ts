import { bundledTitles } from "./profile-catalog"
import { supabase } from "./supabase"

export async function getProfileTitles() {
  const result = await supabase?.from("game_profile_titles").select("id,type,name")
    .order("id").abortSignal(AbortSignal.timeout(3500))
  if (!result?.data || result.error) return bundledTitles
  const titles = result.data
  if (titles.filter(({ type }) => type === 1).length < 30 || titles.filter(({ type }) => type === 2).length < 30) {
    return bundledTitles
  }
  return titles
}
