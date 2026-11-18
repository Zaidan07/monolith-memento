import { boardCredit, downloadBoardPng, loadPortrait } from "./board-png"
import { impressionSheetTitle, type Impression } from "./impression"
import type { Trekker } from "./trekkers"

function wrapText(ctx: CanvasRenderingContext2D, text: string, width: number) {
  return text.split(/\r?\n/).flatMap((paragraph) => {
    const lines: string[] = []
    let line = ""
    for (const word of paragraph.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word
      if (ctx.measureText(next).width <= width) {
        line = next
        continue
      }
      if (line) lines.push(line)
      line = ""
      for (const character of word) {
        if (ctx.measureText(line + character).width > width) {
          lines.push(line)
          line = ""
        }
        line += character
      }
    }
    return [...lines, line]
  })
}

export async function exportImpressionPng(trekker: Trekker, entry: Impression, playerName?: string, title?: string) {
  const portrait = await loadPortrait(trekker)
  const canvas = document.createElement("canvas")
  canvas.width = 1200
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas is unavailable.")

  ctx.font = "25px sans-serif"
  const columns = [
    { x: 50, width: 202, label: "Character", lines: [] },
    { x: 252, width: 449, label: "First impression", lines: wrapText(ctx, entry.first, 410) },
    { x: 701, width: 449, label: "How I see them now", lines: wrapText(ctx, entry.current, 410) },
  ]
  const rowHeight = Math.max(185, ...columns.map(({ lines }) => 32 * lines.length + 46))
  canvas.height = rowHeight + 260
  ctx.fillStyle = "#111827"
  ctx.fillRect(0, 0, 1200, canvas.height)
  ctx.fillStyle = "#f1f0ff"
  ctx.font = "bold 52px sans-serif"
  ctx.fillText(impressionSheetTitle(title), 50, 91, 1100)
  columns.forEach(({ x, width, label, lines }) => {
    ctx.fillStyle = "#322958"
    ctx.fillRect(x, 126, width - 2, 58)
    ctx.fillStyle = "#202a43"
    ctx.fillRect(x, 186, width - 2, rowHeight)
    ctx.fillStyle = "#f1f0ff"
    ctx.font = "bold 25px sans-serif"
    ctx.fillText(label, x + 16, 164, width - 32)
    ctx.font = "25px sans-serif"
    lines.forEach((line, index) => ctx.fillText(line, x + 16, 225 + index * 32, width - 32))
  })
  if (portrait) ctx.drawImage(portrait, 72, 204, 105, 105)
  ctx.fillStyle = "#f1f0ff"
  ctx.font = "bold 24px sans-serif"
  ctx.fillText(trekker.name, 72, 340, 158)
  ctx.fillStyle = "#b9c2da"
  ctx.font = "22px sans-serif"
  ctx.fillText(boardCredit, 50, canvas.height - 37)
  if (playerName) {
    ctx.textAlign = "right"
    ctx.fillText("Created by " + playerName, 1150, canvas.height - 37, 330)
  }
  await downloadBoardPng(canvas, "stella-sora-first-impression.png")
}
