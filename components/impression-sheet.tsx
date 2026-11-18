import { impressionSheetTitle, type Impression } from "../lib/impression"
import type { Trekker } from "../lib/trekkers"
import { TrekkerArt } from "./trekker-art"

export function ImpressionSheet({ trekker, entry, title, playerName, shared }: {
  trekker?: Trekker
  entry: Impression
  title?: string
  playerName?: string
  shared?: boolean
}) {
  const Heading = shared ? "h1" : "h2"
  return (
    <section className="impression-card impression-sheet">
      <Heading>{impressionSheetTitle(title)}</Heading>
      <table>
        <thead><tr><th scope="col">Character</th><th scope="col">First impression</th><th scope="col">How I see them now</th></tr></thead>
        <tbody><tr>
          <th scope="row">{trekker ? <><TrekkerArt trekker={trekker} />{trekker.name}</> : "—"}</th>
          <td>{entry.first || "—"}</td><td>{entry.current || "—"}</td>
        </tr></tbody>
      </table>
      {playerName && <footer>Created by {playerName}</footer>}
    </section>
  )
}
