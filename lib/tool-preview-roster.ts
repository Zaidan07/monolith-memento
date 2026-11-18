import { supabase } from "./supabase"
import type { Trekker } from "./trekkers"

const storagePath = "/storage/v1/object/public/trekkers/"

export async function getToolPreviewRoster() {
  if (!supabase) return []

  const [roster, files] = await Promise.all([
    supabase.from("trekkers").select("id,name,element,image_url,slug").order("name")
      .abortSignal(AbortSignal.timeout(5000)),
    supabase.storage.from("trekkers").list("", { limit: 100 }, { signal: AbortSignal.timeout(5000) }),
  ])

  const bucket = supabase.storage.from("trekkers")
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")
  const prefix = base ? base + storagePath : null
  const filenames = new Map((files.data ?? []).filter(({ name }) => /\.(webp|png|jpe?g|avif)$/i.test(name))
    .map(({ name }) => [name.replace(/\.[^.]+$/, "").toLowerCase(), name]))

  return (roster.data ?? []).map(({ id, name, element, image_url, slug }): Trekker => {
    const original = image_url?.split("/").at(-1)?.replace(/\.[^.]+$/, "").toLowerCase()
    const filename = filenames.get(slug.toLowerCase()) ?? filenames.get(original ?? "")
    const storageUrl = prefix && image_url?.startsWith(prefix) ? image_url : null
    return { id, name, element, image_url: storageUrl ?? (filename ? bucket.getPublicUrl(filename).data.publicUrl : null) }
  }).sort((a, b) => Number(!!b.image_url) - Number(!!a.image_url))
}
