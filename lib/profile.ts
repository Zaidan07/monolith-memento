import { elements, type Trekker } from "./trekkers"

export const profileFields = [
  { key: "displayName", label: "Display name", limit: 32 },
  { key: "favoriteTrekkerId", label: "Favorite Trekker", limit: 36 },
  { key: "favoriteElement", label: "Favorite element", limit: 12 },
  { key: "startedPlaying", label: "Started playing", limit: 32 },
  { key: "favoriteStory", label: "Favorite story", limit: 64 },
  { key: "favoriteDisc", label: "Favorite disc", limit: 64 },
  { key: "favoriteEvent", label: "Favorite event", limit: 64 },
  { key: "favoriteActivity", label: "Favorite activity", limit: 64 },
  { key: "favoriteMemory", label: "Favorite memory", limit: 96 },
] as const

export type ProfileKey = typeof profileFields[number]["key"]
export const gameTextFields = [
  { key: "guild", limit: 24 }, { key: "uid", limit: 16 }, { key: "level", limit: 3 },
  { key: "title", limit: 100 }, { key: "titlePrefix", limit: 50 }, { key: "titleSuffix", limit: 50 },
  { key: "badge", limit: 100 }, { key: "motto", limit: 120 },
] as const
export type GameTextKey = typeof gameTextFields[number]["key"]
export type CoreTrekker = { id: string; level: string }
export type GameProfile = Record<GameTextKey, string> & { webUid: string; core: CoreTrekker[] }
export type Profile = Record<ProfileKey, string> & { game: GameProfile }

function readGameProfile(input: unknown, roster: Trekker[], trim: boolean): GameProfile {
  const source = input && typeof input === "object" ? input as Partial<GameProfile> : {}
  const fields = Object.fromEntries(gameTextFields.map(({ key, limit }) => {
    const text = typeof source[key] === "string" ? source[key] : ""
    const value = key === "uid" || key === "level" ? text.replace(/\D/g, "") : trim ? text.trim() : text
    return [key, value.slice(0, limit)]
  })) as Record<GameTextKey, string>
  const slots = Array.isArray(source.core) ? source.core : []
  const core = Array.from({ length: 3 }, (_, index) => {
    const slot = slots[index]
    return {
      id: roster.some(({ id }) => id === slot?.id) ? slot.id : "",
      level: typeof slot?.level === "string" ? slot.level.replace(/\D/g, "").slice(0, 3) : "",
    }
  })
  return { ...fields, core, webUid: typeof source.webUid === "string" && /^[0-9a-f]{8}$/.test(source.webUid) ? source.webUid : "" }
}

export function readProfile(input: unknown, roster: Trekker[], trim = true): Profile {
  const source = input && typeof input === "object" ? input as Partial<Profile> : {}
  const profile = Object.fromEntries(profileFields.map(({ key, limit }) => {
    const text = typeof source[key] === "string" ? source[key] : ""
    return [key, (trim ? text.trim() : text).slice(0, limit)]
  })) as Record<ProfileKey, string>
  if (!roster.some(({ id }) => id === profile.favoriteTrekkerId)) profile.favoriteTrekkerId = ""
  if (!elements.some((element) => element === profile.favoriteElement)) profile.favoriteElement = ""
  return { ...profile, game: readGameProfile(source.game, roster, trim) }
}
