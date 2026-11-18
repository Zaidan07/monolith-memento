import { boardCredit, downloadBoardPng, loadPortrait } from "./board-png"
import { bingoTitle, center, side, type BingoCells } from "./bingo"
import type { Trekker } from "./trekkers"

export async function exportBingoPng(cells: BingoCells, roster: Trekker[], playerName?: string, title?: string) {
  const trekkers = cells.map((id) => roster.find((trekker) => trekker.id === id))
  const images = await Promise.all(trekkers.map(loadPortrait))
  const canvas = document.createElement("canvas")
  canvas.width = 1200
  canvas.height = 1300
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas is unavailable.")
  ctx.fillStyle = "#eff1fe"
  ctx.fillRect(0, 0, 1200, 1300)
  ctx.fillStyle = "#222854"
  ctx.font = "bold 60px sans-serif"
  ctx.fillText(bingoTitle(title), 50, 85, canvas.width - 100)
  cells.forEach((_, index) => {
    const x = 50 + (index % side) * 222
    const y = 120 + Math.floor(index / side) * 222
    const trekker = trekkers[index]
    const image = images[index]
    ctx.fillStyle = index === center ? "#514eb1" : "#fff"
    ctx.fillRect(x, y, 212, 212)
    ctx.fillStyle = index === center ? "#fff" : "#222854"
    ctx.textAlign = "center"
    if (index === center) {
      ctx.font = "bold 40px sans-serif"
      ctx.fillText("FREE", x + 106, y + 120)
      return
    }
    if (image) {
      ctx.drawImage(image, x + 39, y + 16, 134, 134)
    } else {
      ctx.font = "bold 32px sans-serif"
      ctx.fillText(trekker?.name.slice(0, 2).toUpperCase() ?? "—", x + 106, y + 96)
    }
    ctx.font = "bold 22px sans-serif"
    ctx.fillText(trekker?.name ?? "Empty", x + 106, y + 186, 190)
  })
  ctx.textAlign = "left"
  ctx.fillStyle = "#505778"
  ctx.font = "22px sans-serif"
  ctx.fillText(boardCredit, 50, 1266)
  if (playerName) {
    ctx.textAlign = "right"
    ctx.fillText("Created by " + playerName, 1150, 1266, 285)
  }
  await downloadBoardPng(canvas, "stella-sora-trekker-bingo.png")
}
