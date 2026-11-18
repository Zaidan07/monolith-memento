import { playerResultTitle } from "./player-name"
import { boardCredit, downloadBoardPng, loadPortrait } from "./board-png"
import { rankingSize } from "./top-nine"
import type { Trekker } from "./trekkers"

export async function exportTopNinePng(items: string[], roster: Trekker[], playerName?: string) {
  const trekkers = Array.from({ length: rankingSize }, (_, index) => roster.find(({ id }) => id === items[index]))
  const portraits = await Promise.all(trekkers.map(loadPortrait))
  const canvas = document.createElement("canvas")
  canvas.width = 1200
  canvas.height = 1200
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas is unavailable.")

  ctx.fillStyle = "#eff1fe"
  ctx.fillRect(0, 0, 1200, 1200)
  ctx.fillStyle = "#222854"
  ctx.font = "bold 62px sans-serif"
  ctx.fillText(playerResultTitle("Favorite Trekkers TOP 9", playerName), 54, 91, canvas.width - 108)
  trekkers.forEach((trekker, index) => {
    const x = 54 + (index % 3) * 368
    const y = 130 + Math.floor(index / 3) * 332
    const image = portraits[index]
    ctx.fillStyle = "#fff"
    ctx.fillRect(x, y, 356, 320)
    ctx.fillStyle = "#514eb1"
    ctx.font = "bold 32px sans-serif"
    ctx.fillText(String(index + 1), x + 18, y + 44)

    ctx.textAlign = "center"
    if (image) {
      ctx.drawImage(image, x + 94, y + 54, 168, 168)
    } else {
      ctx.font = "bold 46px sans-serif"
      ctx.fillText(trekker?.name.slice(0, 2).toUpperCase() ?? "—", x + 178, y + 151)
    }
    ctx.fillStyle = "#222854"
    ctx.font = "bold 28px sans-serif"
    ctx.fillText(trekker?.name ?? "Empty", x + 178, y + 272, 320)
    ctx.textAlign = "left"
  })
  ctx.fillStyle = "#505778"
  ctx.font = "22px sans-serif"
  ctx.fillText(boardCredit, 54, 1161)
  await downloadBoardPng(canvas, "stella-sora-top-nine.png")
}
