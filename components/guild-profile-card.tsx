"use client"

import Image from "next/image"
import { elementStripe, trekkerFullArt } from "../lib/trekker-full-art"
import { guildRunes, honorBanner, honorTitles, officialElementIcon, type ProfileTitle } from "../lib/profile-catalog"
import { Copy, Pencil, UserRound } from "lucide-react"
import { useState } from "react"
import { elementSymbols } from "../lib/favorite-result"
import type { GameProfile, GameTextKey, Profile } from "../lib/profile"
import type { Element, Trekker } from "../lib/trekkers"
import { TrekkerArt } from "./trekker-art"

export const coreDragType = "application/x-stella-profile-trekker"

function ElementIcon({ element }: { element: Element }) {
  const [failed, setFailed] = useState(false)
  const source = officialElementIcon(element)
  if (source && !failed) {
    return <Image src={source} alt="" width={24} height={24} unoptimized onError={() => setFailed(true)} />
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true"><path d={elementSymbols[element].path} /></svg>
}

export function GuildProfileCard({ profile, roster, titles = [], onGameEdit, onNameEdit }: {
  profile: Profile
  roster: Trekker[]
  titles?: ProfileTitle[]
  onGameEdit?: (game: GameProfile) => void
  onNameEdit?: (name: string) => void
}) {
  const { game } = profile
  const [guildOpen, setGuildOpen] = useState(false)
  const [titleOpen, setTitleOpen] = useState(false)
  const [honorOpen, setHonorOpen] = useState(false)
  const [failedBanner, setFailedBanner] = useState<string | null>(null)
  const [mottoOpen, setMottoOpen] = useState(false)
  const [copyStatus, setCopyStatus] = useState("")
  const avatar = roster.find(({ id }) => id === profile.favoriteTrekkerId)
  const uid = game.uid || game.webUid
  const prefix = game.titlePrefix || titles.find(({ type, name }) => type === 1 && game.title.startsWith(name + " "))?.name || ""
  const suffix = game.titleSuffix || titles.find(({ type, name }) => type === 2 && game.title === prefix + " " + name)?.name || ""
  const banner = honorBanner(game.badge)
  const guild = guildRunes(game.guild)
  const honorMatches = honorTitles.filter(({ name }) => name.toLowerCase().includes(game.badge.toLowerCase()))

  function changeTitle(position: "titlePrefix" | "titleSuffix", value: string) {
    const titlePrefix = position === "titlePrefix" ? value : prefix
    const titleSuffix = position === "titleSuffix" ? value : suffix
    onGameEdit?.({ ...game, titlePrefix, titleSuffix, title: [titlePrefix, titleSuffix].filter(Boolean).join(" ") })
  }

  function update(key: GameTextKey, value: string) {
    onGameEdit?.({ ...game, [key]: value })
  }

  function updateCore(index: number, field: "id" | "level", value: string) {
    onGameEdit?.({ ...game, core: game.core.map((slot, position) => position === index ? { ...slot, [field]: value } : slot) })
  }

  return (
    <article className="guild-profile" aria-label="Stella Sora player card">
      <div className="guild-bar">
        <div className="guild-rune-name">
          {onGameEdit ? <button type="button" className="guild-runes" aria-label={game.guild ? "Edit guild " + game.guild : "Add guild"} onClick={() => setGuildOpen((open) => !open)}>{guild || "＋"}</button>
            : <strong className="guild-runes" aria-label={game.guild || undefined}>{guild || "—"}</strong>}
          {onGameEdit && guildOpen && <input aria-label="Guild" placeholder="Guild name" value={game.guild} maxLength={24}
            autoFocus onChange={(event) => update("guild", event.target.value)} />}
        </div>
        <div className="guild-uid">
          {onGameEdit ? <label>UID: <input aria-label="Game UID" inputMode="numeric" placeholder={game.webUid || "—"} value={game.uid} onChange={(e) => update("uid", e.target.value)} /></label> : <span>UID: {uid || "—"}</span>}
          <button type="button" disabled={!uid} aria-label="Copy UID" onClick={async () => {
            try { await navigator.clipboard.writeText(uid); setCopyStatus("UID copied.") }
            catch { setCopyStatus("Could not copy UID.") }
          }}><Copy size={18} aria-hidden="true" /></button>
          <span className="sr-only" role="status">{copyStatus}</span>
        </div>
      </div>
      <div className="guild-player">
        <div className="guild-identity">
          <div className="guild-avatar">
            {avatar ? <TrekkerArt trekker={avatar} size={256} /> : <UserRound aria-hidden="true" />}
            {game.level && <span className="guild-level"><strong>{game.level}</strong><small>Lv.</small></span>}
          </div>
          <div className="guild-identity-fields">
            {onNameEdit ? (
              <label><input aria-label="Player name" maxLength={32} value={profile.displayName} placeholder="Player name" onChange={(e) => onNameEdit(e.target.value)} /><Pencil size={19} aria-hidden="true" /></label>
            ) : <strong>{profile.displayName || "Player name"}</strong>}
            {onGameEdit ? (
              <>
                <button className="guild-title-display" type="button" aria-expanded={titleOpen} onClick={() => setTitleOpen((open) => !open)}>
                  <span>{game.title || "Choose title"}</span><Pencil size={19} aria-hidden="true" />
                </button>
                {titleOpen && <div className="guild-title-parts">
                  <select aria-label="Title prefix" value={prefix} onChange={(event) => changeTitle("titlePrefix", event.target.value)}>
                    <option value="">Prefix</option>{titles.filter((title) => title.type === 1).map(({ id, name }) => <option key={id} value={name}>{name}</option>)}
                  </select>
                  <select aria-label="Title suffix" value={suffix} onChange={(event) => changeTitle("titleSuffix", event.target.value)}>
                    <option value="">Suffix</option>{titles.filter((title) => title.type === 2).map(({ id, name }) => <option key={id} value={name}>{name}</option>)}
                  </select>
                </div>}
              </>
            ) : <span className="guild-title-display">{game.title || "—"}</span>}
            {onGameEdit && <label className="guild-account-level">Account level <input aria-label="Account level" inputMode="numeric" value={game.level} onChange={(e) => update("level", e.target.value)} /></label>}
          </div>
        </div>
        <div className="guild-badges">
          {(game.badge || onGameEdit) && <div className="guild-honor">
            {onGameEdit ? <button type="button" className="guild-honor-banner" aria-expanded={honorOpen} aria-label="Edit Honor title" onClick={() => setHonorOpen((open) => !open)}>
              {banner && failedBanner !== banner ? <Image src={banner} alt={game.badge} width={420} height={100} unoptimized onError={() => setFailedBanner(banner)} /> : <strong>{game.badge || "Choose Honor title"}</strong>}
            </button> : <div className="guild-honor-banner">
              {banner && failedBanner !== banner ? <Image src={banner} alt={game.badge} width={420} height={100} unoptimized onError={() => setFailedBanner(banner)} /> : <strong>{game.badge}</strong>}
            </div>}
            {onGameEdit && honorOpen && <>
              <input aria-label="Search Honor titles" list="novaria-honor-titles" placeholder="Search or enter a custom title"
                value={game.badge} maxLength={100} onChange={(event) => update("badge", event.target.value)} />
              <datalist id="novaria-honor-titles">{honorMatches.map(({ id, name }) => <option key={id} value={name} />)}</datalist>
            </>}
          </div>}
          {profile.favoriteElement && <span aria-label={profile.favoriteElement}><ElementIcon element={profile.favoriteElement as Element} />{profile.favoriteElement}</span>}
          {profile.startedPlaying && <span>{profile.startedPlaying}</span>}
        </div>
      </div>
      <div className="guild-motto">
        {onGameEdit && mottoOpen ? <textarea aria-label="Motto" autoFocus maxLength={120} value={game.motto} onChange={(e) => update("motto", e.target.value)} /> : <p>{game.motto || "—"}</p>}
        {onGameEdit && <button type="button" aria-label={mottoOpen ? "Done editing motto" : "Edit motto"} onClick={() => setMottoOpen((open) => !open)}>{mottoOpen ? "Done" : "Edit"}</button>}
      </div>
      <h2 className="guild-core-title">Guild Core Member</h2>
      <ol className="guild-core">
        {game.core.map((slot, index) => {
          const trekker = roster.find(({ id }) => id === slot.id)
          const art = trekkerFullArt(trekker)
          const [stripeStart, stripeEnd] = elementStripe[trekker?.element ?? "Lux"]
          return (
            <li key={index} onDragOver={onGameEdit ? (event) => {
              if (event.dataTransfer.types.includes(coreDragType)) event.preventDefault()
            } : undefined} onDrop={onGameEdit ? (event) => {
              const id = event.dataTransfer.getData(coreDragType)
              if (!roster.some((item) => item.id === id)) return
              event.preventDefault()
              updateCore(index, "id", id)
            } : undefined}>
              <div className="guild-core-portrait" data-element={trekker?.element}>
                {art ? <Image className="guild-core-full-art" src={art} fill unoptimized alt="" draggable={false} /> : <UserRound aria-hidden="true" />}
                {trekker && <span className="guild-core-element" aria-label={trekker.element}><ElementIcon element={trekker.element} /></span>}
                <div className="guild-core-caption">
                  {slot.level && trekker && <span className="guild-core-level">Lv.{slot.level}</span>}
                  <strong>{trekker?.name || "Empty"}</strong>
                </div>
                <span className="guild-core-stripe" aria-hidden="true" style={{ background: `linear-gradient(90deg, ${stripeStart}, ${stripeEnd})` }} />
              </div>
              {onGameEdit && <div className="guild-core-fields">
                <select aria-label={`Core Trekker ${index + 1}`} value={slot.id} onChange={(e) => updateCore(index, "id", e.target.value)}>
                  <option value="">Choose Trekker</option>
                  {roster.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
                </select>
                <input aria-label={`Core Trekker ${index + 1} level`} inputMode="numeric" placeholder="Lv." value={slot.level} onChange={(e) => updateCore(index, "level", e.target.value)} />
              </div>}
            </li>
          )
        })}
      </ol>
    </article>
  )
}
