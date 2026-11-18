import { profileFields, type Profile } from "../lib/profile"
import type { Trekker } from "../lib/trekkers"
import { TrekkerArt } from "./trekker-art"

export function NovariaCard({ profile, roster }: { profile: Profile; roster: Trekker[] }) {
  const favorite = roster.find(({ id }) => id === profile.favoriteTrekkerId)
  return (
    <dl className="novaria-card">
      {profileFields.map(({ key, label }) => (
        <div key={key}>
          <dt>{label}</dt>
          <dd>{key === "favoriteTrekkerId" ? (
            favorite ? <span className="novaria-trekker" data-element={favorite.element}>
              <TrekkerArt trekker={favorite} />{favorite.name}
            </span> : "—"
          ) : profile[key] || "—"}</dd>
        </div>
      ))}
    </dl>
  )
}
