import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import { createClient } from "@supabase/supabase-js"

const pool = JSON.parse(await readFile(new URL("../data/moments.json", import.meta.url), "utf8"))
const wiki = "https://stellasora.miraheze.org"
const cdn = "https://static.wikitide.net/stellasorawiki"
const mode = process.argv[2]
if (!["--dry-run", "--apply"].includes(mode)) throw new Error("Specify --dry-run or --apply.")

let bucket
if (mode === "--apply") {
  const project = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SECRET_KEY
  if (!secret?.startsWith("sb_secret_") || !project || !/^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(project)) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.")
  }
  const client = createClient(project, secret, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await client.storage.getBucket("moments")
  if (error && Number(error.statusCode ?? error.status) !== 404 && !/bucket not found/i.test(error.message)) throw error
  if (!data) {
    const { error: creationError } = await client.storage.createBucket("moments", { public: true })
    if (creationError) throw creationError
  } else if (!data.public) {
    const { error: updateError } = await client.storage.updateBucket("moments", { public: true })
    if (updateError) throw updateError
  }
  bucket = client.storage.from("moments")
}

const filename = ({ name }) => name.replaceAll(" ", "_") + "_Memory_Snapshot.png"
const redirects = new Map()
try {
  const api = new URL("/w/api.php", wiki)
  api.search = new URLSearchParams({
    action: "query", prop: "imageinfo", iiprop: "url", format: "json",
    titles: pool.map((item) => "File:" + filename(item)).join("|"),
  }).toString()
  const response = await fetch(api, { signal: AbortSignal.timeout(5500) })
  if (response.ok) {
    const data = await response.json()
    for (const page of Object.values(data.query?.pages ?? {})) {
      const url = page.imageinfo?.[0]?.url
      if (typeof url === "string" && url.startsWith(cdn + "/")) redirects.set(page.title.replace(/^File:/, "").replaceAll(" ", "_"), url)
    }
  }
} catch {
  // The exact MediaWiki filename resolves through the wiki's hashed upload path.
}

let cursor = 0
let count = 0
const failures = []
async function sync() {
  while (cursor < pool.length) {
    const moment = pool[cursor++]
    try {
      const file = filename(moment)
      const hash = createHash("md5").update(file).digest("hex")
      const source = new URL(redirects.get(file) ?? `${cdn}/${hash[0]}/${hash.slice(0, 2)}/${encodeURIComponent(file)}`)
      if (bucket) source.searchParams.set("moment-sync", "full")
      const response = await fetch(source, {
        signal: AbortSignal.timeout(30000),
        headers: bucket ? undefined : { Range: "bytes=0-23" },
      })
      if (!response.ok || (bucket && response.status !== 200) || !response.headers.get("content-type")?.startsWith("image/png")) {
        throw new Error(`Wiki CDN returned HTTP ${response.status}`)
      }
      const bytes = Buffer.from(await response.arrayBuffer())
      if (bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a" || bytes.length < 24) throw new Error("Invalid PNG")
      if (bucket) {
        const { error } = await bucket.upload(moment.slug + ".png", bytes, {
          contentType: "image/png", cacheControl: "86400", upsert: true,
        })
        if (error) throw error
      }
      count++
    } catch (error) {
      failures.push(`${moment.name}: ${error.message}`)
    }
  }
}
await Promise.all(Array.from({ length: 5 }, sync))
console.log(`${count}/${pool.length} Memory Snapshots ${bucket ? "uploaded" : "verified"}.`)
if (failures.length) {
  console.error(failures.join("\n"))
  process.exitCode = 1
}
