import { readFile } from "node:fs/promises"
import { createClient } from "@supabase/supabase-js"

const sources = JSON.parse(await readFile(new URL("../data/disc-previews.json", import.meta.url), "utf8"))
const mode = process.argv[2]
if (!["--dry-run", "--apply"].includes(mode)) throw new Error("Specify --dry-run or --apply.")

const previews = await Promise.all(Object.values(sources).map(async ({ file, url }) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) })
  if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  if (bytes.length < 24 || bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error(`${file}: not a PNG`)
  }
  return { name: file + ".png", bytes }
}))

if (mode === "--dry-run") {
  console.log(previews.map(({ name }) => name + ": verified").join("\n"))
} else {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SECRET_KEY
  if (!secret?.startsWith("sb_secret_") || !projectUrl || !/^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(projectUrl)) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.")
  }
  const { storage } = createClient(projectUrl, secret, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: bucket, error } = await storage.getBucket("discs")
  if (error && Number(error.statusCode ?? error.status) !== 404 && !/bucket not found/i.test(error.message)) throw error
  const settings = { public: true }
  if (!bucket || !bucket.public) {
    const result = bucket ? await storage.updateBucket("discs", settings) : await storage.createBucket("discs", settings)
    if (result.error) throw result.error
  }
  const results = await Promise.all(previews.map(async ({ name, bytes }) => {
    const result = await storage.from("discs").upload(name, bytes, { contentType: "image/png", cacheControl: "86400", upsert: true })
    return { name, error: result.error }
  }))
  for (const result of results) {
    if (result.error) {
      console.error(`${result.name}: ${result.error.message}`)
      process.exitCode = 1
    } else console.log(`${result.name}: uploaded`)
  }
}
