const source = new URL('https://api.ennead.cc/stella/characters')
const elements = new Set(['Ignis', 'Aqua', 'Terra', 'Ventus', 'Lux', 'Umbra'])
const roles = new Set(['Vanguard', 'Versatile', 'Support'])
const columns = ['slug', 'name', 'element', 'role', 'rarity', 'faction', 'image_url']

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(30000),
  })
  if (!response.ok) {
    throw new Error(`${url.hostname} HTTP ${response.status}: ${(await response.text()).slice(0, 500)}`)
  }
  return response
}

function mapRoster(roster) {
  if (!Array.isArray(roster) || roster.length === 0) {
    throw new Error('API Stella Sora tidak mengembalikan roster yang valid.')
  }

  const slugs = new Set()
  return roster.map((character) => {
    const name = character?.name?.trim()
    const slug = name?.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    if (!slug || slugs.has(slug) || !elements.has(character.element)
      || !roles.has(character.position) || ![4, 5].includes(character.grade)
      || typeof character.faction !== 'string' || !character.faction.trim()) {
      throw new Error(`Data Trekker tidak valid atau slug duplikat: ${name ?? character?.id ?? '?'}`)
    }

    const image = new URL(character.icon ?? character.portrait ?? '', source)
    if (image.origin !== source.origin || !image.pathname.startsWith('/stella/assets/')) {
      throw new Error(`URL gambar tidak valid untuk ${name}`)
    }

    slugs.add(slug)
    return {
      slug,
      name,
      element: character.element,
      role: character.position,
      rarity: character.grade,
      faction: character.faction.trim(),
      image_url: image.href,
    }
  })
}

function printSql(rows) {
  const values = rows.map((row) => '(' + columns.map((column) => {
    const value = row[column]
    return typeof value === 'number' ? value : "'" + value.replaceAll("'", "''") + "'"
  }).join(', ') + ')')
  const updates = columns.slice(1).map((column) => `${column} = excluded.${column}`)
  console.log(`insert into public.trekkers (${columns.join(', ')}) values\n${values.join(',\n')}\n`
    + `on conflict (slug) do update set\n  ${updates.join(',\n  ')};`)
}

async function main() {
  const args = process.argv.slice(2)
  const [mode] = args
  if (args.length > 1 || (mode && !['--dry-run', '--sql', '--apply'].includes(mode))) {
    throw new Error('Gunakan --dry-run, --sql, atau --apply.')
  }

  const rows = mapRoster(await (await request(source)).json())
  if (mode === '--sql') {
    printSql(rows)
    return
  }
  if (mode !== '--apply') {
    console.log(`Dry run: ${rows.length} Trekker lolos validasi.`)
    console.table(rows.map(({ slug, element, role, rarity }) => ({ slug, element, role, rarity })))
    return
  }

  const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SECRET_KEY: key } = process.env
  if (!url || !key?.startsWith('sb_secret_')) {
    throw new Error('Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SECRET_KEY di .env.local.')
  }
  const target = new URL('/rest/v1/trekkers', url)
  if (target.protocol !== 'https:' || !target.hostname.endsWith('.supabase.co')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL harus berupa URL HTTPS proyek Supabase.')
  }
  target.searchParams.set('on_conflict', 'slug')
  target.searchParams.set('select', 'slug')
  const response = await request(target, {
    method: 'POST',
    redirect: 'error',
    headers: {
      apikey: key,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(rows),
  })
  const saved = await response.json()
  if (saved.length !== rows.length) {
    throw new Error(`Supabase mengembalikan ${saved.length} dari ${rows.length} baris.`)
  }
  console.log(`Sync selesai: ${saved.length} Trekker disimpan.`)
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
