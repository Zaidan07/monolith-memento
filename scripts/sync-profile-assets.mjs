import { readFile } from "node:fs/promises"
import { createClient } from "@supabase/supabase-js"

const catalog = JSON.parse(await readFile(new URL("../data/profile-catalog.json", import.meta.url), "utf8"))
const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const secret = process.env.SUPABASE_SECRET_KEY
const mode = process.argv[2]

if (!["--dry-run", "--apply"].includes(mode)) {
  throw new Error("Specify --dry-run or --apply.")
}

const images = catalog.honors.flatMap(({ id, banner, icon }) =>
  [[banner, `${id}-banner.png`], [icon, `${id}-icon.png`]]
    .filter(([path]) => typeof path === "string" && path.startsWith("Icon/HonorTitle/"))
)

console.log(`${catalog.titles.length} Title rows and ${images.length} Honor asset paths.`)
if (mode === "--apply") {
  if (!secret?.startsWith("sb_secret_") || !projectUrl || !/^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(projectUrl)) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and a Supabase secret key in .env.local.")
  }

  const client = createClient(projectUrl, secret, { auth: { persistSession: false, autoRefreshToken: false } })
  const { error: titleError } = await client.from("game_profile_titles").upsert(catalog.titles)
  if (titleError) throw new Error("Run profiles-catalog.sql first. " + titleError.message)

  const { data: bucket, error: lookupError } = await client.storage.getBucket("badges")
  if (lookupError && ![400, 404].includes(Number(lookupError.statusCode ?? lookupError.status))) throw lookupError
  if (!bucket) {
    const { error } = await client.storage.createBucket("badges", { public: true })
    if (error) throw error
  } else if (!bucket.public) {
    throw new Error("Set the badges bucket to public before syncing.")
  }

  let cursor = 0
  const failures = []
  const unavailable = []
  async function sync() {
    while (cursor < images.length) {
      const [path, filename] = images[cursor++]
      try {
        const response = await fetch(`https://api.ennead.cc/stella/assets/${path}`, {
          signal: AbortSignal.timeout(30000),
        })
        if (response.status === 404) {
          unavailable.push(filename)
          continue
        }
        if (!response.ok || !response.headers.get("content-type")?.includes("image/png")) {
          throw new Error(`Unexpected source response ${response.status}`)
        }
        const bytes = await response.arrayBuffer()
        const { error } = await client.storage.from("badges").upload(filename, bytes, {
          contentType: "image/png", cacheControl: "86400", upsert: true,
        })
        if (error) throw error
      } catch (error) {
        failures.push(`${filename}: ${error.message}`)
      }
    }
  }
  await Promise.all(Array.from({ length: 4 }, sync))
  console.log(`${images.length - unavailable.length - failures.length} synced, ${unavailable.length} missing at source, ${failures.length} failed.`)
  for (const issue of [...unavailable, ...failures]) console.error(issue)
  if (failures.length) process.exitCode = 1
}
