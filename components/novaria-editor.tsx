"use client"

import { useEffect, useState } from "react"
import { Download, Save, Share2 } from "lucide-react"
import { publishProfile } from "../app/profile/actions"
import { getSessionId } from "../lib/browser-session"
import { exportProfilePng } from "../lib/profile-png"
import type { ProfileTitle } from "../lib/profile-catalog"
import { profileFields, readProfile, type ProfileKey } from "../lib/profile"
import { elements, type Trekker } from "../lib/trekkers"
import { GuildProfileCard, coreDragType } from "./guild-profile-card"
import { NovariaCard } from "./novaria-card"

const draftKey = "stella-sora-pick:novaria-profile"
const sessionKey = "stella-sora-pick:profile-session"
const dragType = coreDragType

export function NovariaEditor({ roster, titles }: { roster: Trekker[]; titles: ProfileTitle[] }) {
  const [profile, setProfile] = useState(() => readProfile(null, roster))
  const [ready, setReady] = useState(false)
  const [pending, setPending] = useState<"save" | "share" | "png" | null>(null)
  const [message, setMessage] = useState("")
  const [shareUrl, setShareUrl] = useState("")

  useEffect(() => {
    try {
      setProfile(readProfile(JSON.parse(localStorage.getItem(draftKey) ?? "null"), roster, false))
    } catch {
      setMessage("This browser could not restore your draft.")
    }
    async function setWebUid() {
      const token = getSessionId(sessionKey)
      const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token))
      const webUid = Array.from(new Uint8Array(hash).slice(0, 4), (byte) => byte.toString(16).padStart(2, "0")).join("")
      setProfile((current) => ({ ...current, game: { ...current.game, webUid } }))
    }
    void setWebUid().catch(() => undefined)
    setReady(true)
  }, [roster])

  function saveDraft(next: typeof profile) {
    setProfile(next)
    setShareUrl("")
    setMessage("")
    try {
      localStorage.setItem(draftKey, JSON.stringify(next))
    } catch {
      setMessage("This browser could not save your draft.")
    }
  }

  function update(key: ProfileKey, value: string) {
    saveDraft({ ...profile, [key]: value })
  }

  async function run(mode: "save" | "share" | "png") {
    const clean = readProfile(profile, roster)
    if (!clean.displayName) return
    setPending(mode)
    setMessage("")
    try {
      if (mode === "png") {
        await exportProfilePng(clean, roster)
        setMessage("PNG ready.")
        return
      }
      const result = await publishProfile(getSessionId(sessionKey), clean, mode)
      if (result.error) {
        setMessage(result.error)
      } else if (result.shareId) {
        setShareUrl(new URL("/share/" + result.shareId, window.location.origin).href)
        setMessage("Share link ready.")
      } else {
        setMessage("Profile saved.")
      }
    } catch {
      setMessage("Could not complete this action. Please try again.")
    } finally {
      setPending(null)
    }
  }

  const disabled = !ready || !!pending
  const canPublish = !disabled && !!profile.displayName.trim()
  return (
    <div className="novaria-profile-page">
      <GuildProfileCard profile={profile} roster={roster} titles={titles}
        onNameEdit={disabled ? undefined : (name) => update("displayName", name)}
        onGameEdit={disabled ? undefined : (game) => saveDraft(readProfile({ ...profile, game }, roster, false))} />
      <div className="novaria-layout">
      <section aria-labelledby="novaria-answers">
        <h2 id="novaria-answers">Your answers</h2>
        <fieldset className="favorite-edit-fields novaria-fields" disabled={disabled}>
          <legend className="sr-only">Edit your Novaria profile</legend>
          {profileFields.map(({ key, label, limit }) => (
            <div className="novaria-field" key={key}
              onDragOver={key === "favoriteTrekkerId" ? (event) => {
                if (!disabled && event.dataTransfer.types.includes(dragType)) event.preventDefault()
              } : undefined}
              onDrop={key === "favoriteTrekkerId" ? (event) => {
                const id = event.dataTransfer.getData(dragType)
                if (!disabled && roster.some((item) => item.id === id)) {
                  event.preventDefault()
                  update(key, id)
                }
              } : undefined}>
              <label htmlFor={`novaria-${key}`}>{label}{key === "displayName" && " (required)"}</label>
              {key === "favoriteTrekkerId" || key === "favoriteElement" ? (
                <select id={`novaria-${key}`} value={profile[key]} onChange={(event) => update(key, event.target.value)}>
                  <option value="">Choose…</option>
                  {key === "favoriteTrekkerId"
                    ? roster.map(({ id, name }) => <option key={id} value={id}>{name}</option>)
                    : elements.map((element) => <option key={element} value={element}>{element}</option>)}
                </select>
              ) : (
                <input id={`novaria-${key}`} maxLength={limit} required={key === "displayName"}
                  placeholder={key === "startedPlaying" ? "e.g. At launch" : undefined}
                  value={profile[key]} onChange={(event) => update(key, event.target.value)} />
              )}
            </div>
          ))}
        </fieldset>
        <details className="novaria-drag-picker">
          <summary>Drag a Trekker to Favorite Trekker or a Core Trekker slot</summary>
          <ul aria-label="Trekker roster">
            {roster.map(({ id, name }) => <li key={id}>
              <button type="button" disabled={disabled} draggable={!disabled}
                onClick={() => update("favoriteTrekkerId", id)} onDragStart={(event) => {
                  event.dataTransfer.setData(dragType, id)
                  event.dataTransfer.effectAllowed = "copy"
                }}>{name}</button>
            </li>)}
          </ul>
        </details>
        <div className="favorite-actions">
          <button className="favorite-primary" type="button" disabled={!canPublish} onClick={() => run("save")}><Save size={16} aria-hidden="true" /> {pending === "save" ? "Saving…" : "Save profile"}</button>
          <button type="button" disabled={!canPublish} onClick={() => run("share")}><Share2 size={16} aria-hidden="true" /> {pending === "share" ? "Creating…" : "Create share link"}</button>
          <button type="button" disabled={!canPublish} onClick={() => run("png")}><Download size={16} aria-hidden="true" /> {pending === "png" ? "Exporting…" : "Download PNG"}</button>
        </div>
        <p className="favorite-status" role="status">{message}</p>
        {shareUrl && (
          <div className="favorite-share">
            <label htmlFor="novaria-share-url">Public share link</label>
            <input id="novaria-share-url" readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} />
            <button type="button" onClick={async () => {
              try {
                await navigator.clipboard.writeText(shareUrl)
                setMessage("Share link copied.")
              } catch {
                setMessage("Select and copy the share link from the field.")
              }
            }}>Copy link</button>
            <a href={shareUrl} target="_blank" rel="noreferrer">Open profile ↗</a>
          </div>
        )}
      </section>
      <section aria-labelledby="novaria-preview">
        <h2 id="novaria-preview">About</h2>
        <NovariaCard profile={profile} roster={roster} />
      </section>
      </div>
    </div>
  )
}
