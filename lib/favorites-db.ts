import { supabase } from "./supabase"
import type { Trekker } from "./trekkers"

export async function getRoster() {
  if (!supabase) throw new Error("Supabase is not configured.")
  const { data, error } = await supabase.from("trekkers")
    .select("id,name,element,image_url").order("name")
    .abortSignal(AbortSignal.timeout(15000))
  if (error) throw new Error("Could not load the Trekker roster.")
  return data as Trekker[]
}
