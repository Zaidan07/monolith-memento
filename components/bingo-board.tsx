import type { DragEvent } from "react"
import { Check, Plus, Sparkles } from "lucide-react"
import { center, side, type BingoCells } from "../lib/bingo"
import type { Trekker } from "../lib/trekkers"
import { TrekkerArt } from "./trekker-art"

export function BingoBoard({ cells, roster, selected, marks, onSelect, onDrop, onDrag }: {
  cells: BingoCells
  roster: Trekker[]
  selected?: number
  marks?: number[]
  onSelect?: (index: number) => void
  onDrop?: (event: DragEvent, index: number) => void
  onDrag?: (event: DragEvent, id: string) => void
}) {
  return (
    <ol className="bingo-board" aria-label="5 by 5 Trekker Bingo board">
      {cells.map((id, index) => {
        if (index === center) return <li key={index} className="bingo-free"><Sparkles aria-hidden="true" size={23} /> FREE</li>
        const trekker = roster.find((item) => item.id === id)
        const label = `Row ${Math.floor(index / side) + 1}, column ${index % side + 1}: ${trekker?.name ?? "empty"}`
        const contents = trekker
          ? <><TrekkerArt trekker={trekker} /><span>{trekker.name}</span></>
          : <Plus size={20} aria-hidden="true" />
        return (
          <li key={index} data-element={trekker?.element}>
            {onSelect ? (
              <button type="button" className="bingo-cell" aria-label={label} aria-pressed={marks ? marks.includes(index) : selected === index} data-marked={marks?.includes(index)}
                draggable={!!trekker && !!onDrag} onClick={() => onSelect(index)}
                onDragOver={onDrop ? (event) => event.preventDefault() : undefined}
                onDrop={onDrop ? (event) => onDrop(event, index) : undefined}
                onDragStart={trekker && onDrag ? (event) => onDrag(event, trekker.id) : undefined}>
                {contents}
                {marks?.includes(index) && <Check className="bingo-hit" aria-hidden="true" size={18} />}
              </button>
            ) : <div className="bingo-cell" aria-label={label}>{contents}</div>}
          </li>
        )
      })}
    </ol>
  )
}
