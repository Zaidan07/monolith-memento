import { createClient } from "@supabase/supabase-js"

const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export function createProjectClient(headers?: Record<string, string>) {
  return projectUrl && publishableKey
  ? createClient(projectUrl, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers },
    })
  : null
}

export const supabase = createProjectClient()

export async function getTrekkerCount() {
  if (!supabase) return null

  try {
    const { count, error } = await supabase.from("trekkers")
      .select("id", { count: "exact", head: true })
      .abortSignal(AbortSignal.timeout(15000))
    return error ? null : count
  } catch {
    return null
  }
}
