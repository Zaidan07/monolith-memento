import { impressionFields, type Impression } from "../lib/impression"
import type { Trekker } from "../lib/trekkers"
import { TrekkerArt } from "./trekker-art"

export function ImpressionCard({ trekker, entry }: { trekker: Trekker; entry: Impression }) {
  return (
    <section className="impression-card" aria-label={`Impressions of ${trekker.name}`}>
      <div className="impression-trekker" data-element={trekker.element}>
        <TrekkerArt trekker={trekker} />
        <div><h2>{trekker.name}</h2><p>{trekker.element}</p></div>
      </div>
      <dl className="impression-pair">
        {impressionFields.map(({ key, label }) => (
          <div key={key}><dt>{label}</dt><dd>{entry[key]}</dd></div>
        ))}
      </dl>
    </section>
  )
}
