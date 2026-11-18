import { Trophy, UserRound } from "lucide-react"
import type { Trekker } from "../lib/trekkers"
import { TrekkerArt } from "./trekker-art"

export type PreviewKind = "favorites" | "bingo" | "top9" | "impression" | "profile" | "leaderboard"

export function ToolPreview({ kind, roster }: { kind: PreviewKind; roster: Trekker[] }) {
  const portrait = (index: number) => {
    const trekker = roster[index % roster.length]
    return <span className="preview-portrait" data-element={trekker?.element}>
      {trekker ? <TrekkerArt trekker={trekker} /> : <UserRound size={16} />}
    </span>
  }

  return (
    <div className={`tool-preview tool-preview-${kind}`} aria-hidden="true">
      {kind === "favorites" && <div className="preview-fan">
        {[1, 0, 2].map((index) => <div key={index}>{portrait(index)}</div>)}
      </div>}
      {kind === "bingo" && <div className="preview-bingo-grid">
        {Array.from({ length: 25 }, (_, index) => <span key={index}>{index === 12 ? <b>FREE</b> : portrait(index)}</span>)}
      </div>}
      {kind === "top9" && <div className="preview-top-grid">
        {Array.from({ length: 9 }, (_, index) => <div key={index}>{portrait(index + 3)}<b>{String(index + 1).padStart(2, "0")}</b></div>)}
      </div>}
      {kind === "impression" && <div className="preview-comparison">
        {["FIRST", "NOW"].map((label) => <div key={label}><b>{label}</b>{portrait(3)}<i /></div>)}
      </div>}
      {kind === "profile" && <div className="preview-profile">
        <div className="preview-profile-grid">{[4, 5, 6, 7].map((index) => <div key={index}>{portrait(index)}</div>)}</div>
        <div className="preview-profile-answers"><b>Novaria Profile</b><span>Favorite element</span><i /><span>Favorite memory</span><i /></div>
      </div>}
      {kind === "leaderboard" && <div className="preview-ranking">
        <Trophy size={26} />
        {[0, 1, 2].map((index) => <div key={index}><b>{index + 1}</b>{portrait(index)}<i /></div>)}
      </div>}
    </div>
  )
}
