import type { DragEvent } from "react"
import { Plus, X } from "lucide-react"
import { elements, type Element, type Picks, type Trekker } from "../lib/trekkers"
import { TrekkerArt } from "./trekker-art"

export function FavoriteBoard({ roster, picks, active, onSelect, onRemove, onDrop }: {
  roster: Trekker[]
  picks: Picks
  active?: Element | "All"
  onSelect?: (element: Element) => void
  onRemove?: (element: Element) => void
  onDrop?: (event: DragEvent, element: Element) => void
}) {
  return (
    <ul className="favorite-board" aria-label="Favorite Trekker picks">
      {elements.map((element) => {
        const trekker = roster.find(({ id }) => id === picks[element])
        const content = (
          <>
            <span className="slot-element">{element}</span>
            {trekker ? <TrekkerArt trekker={trekker} /> : <span className="empty-slot-icon"><Plus size={22} aria-hidden="true" /></span>}
            <span className="slot-name">{trekker?.name ?? (onSelect ? "Choose Trekker" : "Empty")}</span>
          </>
        )
        return (
          <li key={element} data-element={element} className="favorite-slot"
            onDragOver={onDrop ? (event) => event.preventDefault() : undefined}
            onDrop={onDrop ? (event) => onDrop(event, element) : undefined}>
            {onSelect ? (
              <button type="button" className="slot-content" onClick={() => onSelect(element)} aria-pressed={active === element}>{content}</button>
            ) : <div className="slot-content">{content}</div>}
            {trekker && onRemove && (
              <button className="slot-remove" type="button" aria-label={`Remove ${trekker.name}`} onClick={() => onRemove(element)}><X size={16} /></button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
