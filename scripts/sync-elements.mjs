import { readFile } from "node:fs/promises"
import { createClient } from "@supabase/supabase-js"

const sources = JSON.parse(await readFile(new URL("../data/element-sources.json", import.meta.url), "utf8"))
const mode = process.argv[2]
if (!["--dry-run", "--apply"].includes(mode)) throw new Error("Specify --dry-run or --apply.")

const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const secret = process.env.SUPABASE_SECRET_KEY
let bucket
if (mode === "--apply") {
  if (!secret?.startsWith("sb_secret_") || !projectUrl || !/^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(projectUrl)) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.")
  }

  const client = createClient(projectUrl, secret, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await client.storage.getBucket("elements")
  if (error && Number(error.statusCode ?? error.status) !== 404 && !/bucket not found/i.test(error.message)) throw error
  if (!data) {
    const { error: creationError } = await client.storage.createBucket("elements", { public: true })
    if (creationError) throw creationError
  } else if (!data.public) {
    const { error: updateError } = await client.storage.updateBucket("elements", { public: true })
    if (updateError) throw updateError
  }
  bucket = client.storage.from("elements")
}

const results = await Promise.allSettled(Object.entries(sources).map(async ([element, source]) => {
  const response = await fetch(source, { signal: AbortSignal.timeout(20000) })
  if (!response.ok) throw new Error(`${element}: HTTP ${response.status}`)
  const svg = await response.text()
  if (!/<svg[\s>]/i.test(svg) || /<(?:script|foreignObject)\b|\son\w+\s*=/i.test(svg)) {
    throw new Error(`${element}: invalid SVG`)
  }
  const filename = element.toLowerCase() + ".svg"
  if (bucket) {
    const { error } = await bucket.upload(filename, Buffer.from(svg), {
      contentType: "image/svg+xml", cacheControl: "86400", upsert: true,
    })
    if (error) throw new Error(`${filename}: ${error.message}`)
  }
  console.log(`${filename}: ${bucket ? "uploaded" : "verified"}`)
}))
for (const result of results) {
  if (result.status === "rejected") {
    console.error(result.reason.message)
    process.exitCode = 1
  }
}
