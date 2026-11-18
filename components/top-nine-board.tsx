import { ChevronDown, ChevronUp, X } from "lucide-react"
import type { DragEvent } from "react"
import { rankingSize } from "../lib/top-nine"
import type { Trekker } from "../lib/trekkers"
import { TrekkerArt } from "./trekker-art"

export function TopNineBoard({ items, roster, onMove, onRemove, onDrag, onDrop }: {
  items: string[]
  roster: Trekker[]
  onMove?: (from: number, to: number) => void
  onRemove?: (index: number) => void
  onDrag?: (event: DragEvent, id: string) => void
  onDrop?: (event: DragEvent, index: number) => void
}) {
  return (
    <ol className="top-nine-board" aria-label="Top nine ranking">
      {Array.from({ length: rankingSize }, (_, index) => {
        const trekker = roster.find(({ id }) => id === items[index])
        return (
          <li key={index} data-element={trekker?.element} draggable={!!trekker && !!onDrag}
            onDragStart={trekker && onDrag ? (event) => onDrag(event, trekker.id) : undefined}
            onDragOver={onDrop ? (event) => event.preventDefault() : undefined}
            onDrop={onDrop ? (event) => onDrop(event, index) : undefined}>
            <span className="top-nine-rank" aria-label={`Rank ${index + 1}`}>{index + 1}</span>
            {trekker ? <><TrekkerArt trekker={trekker} /><strong>{trekker.name}</strong></> : <span className="top-nine-empty">Empty</span>}
            {trekker && onMove && onRemove && (
              <div className="top-nine-controls">
                <button type="button" aria-label={`Move ${trekker.name} up`} disabled={index === 0} onClick={() => onMove(index, index - 1)}><ChevronUp size={16} aria-hidden="true" /></button>
                <button type="button" aria-label={`Move ${trekker.name} down`} disabled={index >= items.length - 1} onClick={() => onMove(index, index + 1)}><ChevronDown size={16} aria-hidden="true" /></button>
                <button type="button" aria-label={`Remove ${trekker.name}`} onClick={() => onRemove(index)}><X size={16} aria-hidden="true" /></button>
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
