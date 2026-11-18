import Image from "next/image"
import type { CSSProperties } from "react"
import { elementStripe, trekkerFullArt } from "../lib/trekker-full-art"
import { favoriteResult } from "../lib/favorite-result"
import { playerResultTitle } from "../lib/player-name"
import { elements, type Picks, type Trekker } from "../lib/trekkers"
import { FavoriteElementIcon } from "./favorite-element-icon"

export function FavoriteResultCard({ picks, roster, playerName }: {
  picks: Picks
  roster: Trekker[]
  playerName: unknown
}) {
  return (
    <article className="favorite-result">
      <header className="favorite-result-header">
        <p className="favorite-result-kicker">{favoriteResult.kicker}</p>
        <h1>{playerResultTitle(favoriteResult.title, playerName)}</h1>
        <p>{favoriteResult.subtitle}</p>
      </header>
      <ul className="favorite-result-grid" aria-label="Favorite Trekkers by element">
        {elements.map((element) => {
          const trekker = roster.find(({ id }) => id === picks[element])
          const art = trekkerFullArt(trekker)
          const [start, end] = elementStripe[element]
          return (
            <li key={element} data-element={element} style={{ "--stripe-start": start, "--stripe-end": end } as CSSProperties}>
              {art && <Image src={art} alt="" fill sizes="(max-width: 760px) 30vw, 170px" />}
              <span className="favorite-result-element-icon"><FavoriteElementIcon element={element} /></span>
              <div className="favorite-result-caption">
                <strong>{trekker?.name ?? "Empty"}</strong>
                <span>{element}</span>
              </div>
            </li>
          )
        })}
      </ul>
      <footer className="favorite-result-footer"><span>{favoriteResult.kicker}</span><span>{favoriteResult.footer}</span></footer>
    </article>
  )
}
