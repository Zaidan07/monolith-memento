import { boardCredit, downloadBoardPng } from "./board-png"
import { formatMomentDate, momentImage, type Moment, type MomentPull } from "./moments"
import { playerResultTitle } from "./player-name"
import { localElementIcon, officialElementIcon } from "./profile-catalog"

async function loadImage(url: string | null) {
  if (!url) return null
  const image = new Image()
  image.crossOrigin = "anonymous"
  image.src = url
  try {
    await image.decode()
    return image
  } catch {
    return null
  }
}

export async function downloadMoment(moment: Moment, pull: MomentPull) {
  const [image, icon] = await Promise.all([
    loadImage(momentImage(moment.slug)),
    loadImage(officialElementIcon(moment.element)).then((result) => result ?? loadImage(localElementIcon(moment.element))),
  ])
  if (!image) throw new Error("Snapshot image is unavailable. Run the moment sync first.")
  const canvas = document.createElement("canvas")
  canvas.width = 2400
  canvas.height = 1700
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas is unavailable.")
  const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight)
  const width = image.naturalWidth * scale
  const height = image.naturalHeight * scale
  ctx.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height)
  const overlay = ctx.createLinearGradient(0, 0, 0, canvas.height)
  overlay.addColorStop(0, "#0e1027df")
  overlay.addColorStop(.22, "#0e102700")
  overlay.addColorStop(.63, "#0e102700")
  overlay.addColorStop(1, "#0e1027ef")
  ctx.fillStyle = overlay
  ctx.fillRect(0, 0, 2400, 1700)
  ctx.fillStyle = "#fff"
  ctx.font = "bold 51px sans-serif"
  ctx.fillText("Moment with YOU.", 80, 120)
  if (moment.grade === 5) {
    ctx.fillStyle = "#ffe5a3"
    ctx.textAlign = "right"
    ctx.fillText("★5 Rare Moment", 2320, 120)
    ctx.textAlign = "left"
  }
  ctx.fillStyle = "#fff"
  ctx.font = "bold 85px sans-serif"
  ctx.fillText(playerResultTitle(`Moment with ${moment.name}`, pull.playerName), 80, 1450, 2240)
  if (icon) ctx.drawImage(icon, 80, 1480, 55, 55)
  ctx.font = "42px sans-serif"
  ctx.fillText(`${moment.element} · ${formatMomentDate(pull.pulledAt)}`, icon ? 156 : 80, 1525)
  ctx.fillStyle = "#c8d1e9"
  ctx.font = "28px sans-serif"
  ctx.fillText(boardCredit, 80, 1640)
  await downloadBoardPng(canvas, `stella-sora-moment-${moment.slug}.png`)
}
