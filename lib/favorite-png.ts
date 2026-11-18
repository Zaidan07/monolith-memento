import { elementStripe } from "./trekker-full-art"
import { localElementIcon, officialElementIcon } from "./profile-catalog"
import { favoriteResult } from "./favorite-result"
import { playerResultTitle } from "./player-name"
import { downloadBoardPng, loadFullPortrait } from "./board-png"
import { elements, type Element, type Picks, type Trekker } from "./trekkers"

async function loadElementImage(element: Element) {
  for (const url of [officialElementIcon(element), localElementIcon(element)]) {
    if (!url) continue
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.src = url
    try {
      await image.decode()
      return image
    } catch {
      // Try the bundled copy of the same icon.
    }
  }
  return null
}

export async function exportFavoritePng(picks: Picks, roster: Trekker[], playerName?: string) {
  const selected = elements.map((element) => roster.find(({ id }) => id === picks[element]))
  const [portraits, icons] = await Promise.all([
    Promise.all(selected.map(loadFullPortrait)),
    Promise.all(elements.map(loadElementImage)),
  ])
  const canvas = document.createElement("canvas")
  canvas.width = 1440
  canvas.height = 654
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas is unavailable.")

  const margin = 54
  const contentWidth = canvas.width - margin * 2
  const background = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  background.addColorStop(0, "#231b3c")
  background.addColorStop(.55, "#13192f")
  background.addColorStop(1, "#0c1626")
  ctx.fillStyle = background
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  const glow = ctx.createRadialGradient(1100, 518, 10, 1100, 518, 510)
  glow.addColorStop(0, "#22718558")
  glow.addColorStop(1, "#22718500")
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#d9e3ff44"
  for (let star = 0; star < 120; star++) {
    const x = (star * 107 + 29) % canvas.width
    const y = (star * 71 + 13) % canvas.height
    ctx.fillRect(x, y, star % 7 === 0 ? 2 : 1, star % 7 === 0 ? 2 : 1)
  }
  ctx.fillStyle = "#c5bbff"
  ctx.font = "bold 21px sans-serif"
  ctx.fillText(favoriteResult.kicker, margin, 68)
  ctx.fillStyle = "#f1f0ff"
  ctx.font = "bold 52px sans-serif"
  ctx.fillText(playerResultTitle(favoriteResult.title, playerName), margin, 137, contentWidth)
  ctx.fillStyle = "#b9c2da"
  ctx.font = "26px sans-serif"
  ctx.fillText(favoriteResult.subtitle, margin, 182)
  ctx.fillStyle = "#394660"
  ctx.fillRect(margin, 209, contentWidth, 2)

  const gap = 14
  const width = (contentWidth - gap * (elements.length - 1)) / elements.length
  const top = 239
  const height = width * 4 / 3
  const stripeHeight = 8
  elements.forEach((element, index) => {
    const x = margin + index * (width + gap)
    const center = x + width / 2
    const trekker = selected[index]
    const portrait = portraits[index]
    const icon = icons[index]
    const [start, end] = elementStripe[element]

    ctx.save()
    ctx.shadowColor = start + "66"
    ctx.shadowBlur = 14
    ctx.fillStyle = "#202a43"
    ctx.beginPath()
    ctx.roundRect(x, top, width, height, 10)
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.clip()

    if (portrait) {
      const scale = Math.max(width / portrait.naturalWidth, height / portrait.naturalHeight)
      const artWidth = portrait.naturalWidth * scale
      const artHeight = portrait.naturalHeight * scale
      ctx.drawImage(portrait, x + (width - artWidth) / 2, top + (height - artHeight) * .25, artWidth, artHeight)
    }

    const bottom = top + height
    const caption = ctx.createLinearGradient(0, bottom - 100, 0, bottom - stripeHeight)
    caption.addColorStop(0, "#080d1c00")
    caption.addColorStop(.55, "#080d1cdd")
    caption.addColorStop(1, "#080d1cfa")
    ctx.fillStyle = caption
    ctx.fillRect(x, bottom - 100, width, 100)
    ctx.textAlign = "center"
    ctx.fillStyle = "#f1f0ff"
    ctx.font = "bold 22px sans-serif"
    ctx.fillText(trekker?.name ?? "Empty", center, bottom - 42, width - 18)
    ctx.fillStyle = end
    ctx.font = "18px sans-serif"
    ctx.fillText(element, center, bottom - 18)

    const stripe = ctx.createLinearGradient(x, 0, x + width, 0)
    stripe.addColorStop(0, start)
    stripe.addColorStop(1, end)
    ctx.fillStyle = stripe
    ctx.fillRect(x, bottom - stripeHeight, width, stripeHeight)
    ctx.restore()
    ctx.strokeStyle = start
    ctx.stroke()

    if (icon) {
      const scale = 42 / Math.max(icon.naturalWidth, icon.naturalHeight)
      ctx.drawImage(icon, x + 6, top + 6, icon.naturalWidth * scale, icon.naturalHeight * scale)
    }
  })

  ctx.fillStyle = "#394660"
  ctx.fillRect(margin, 578, contentWidth, 2)
  ctx.fillStyle = "#b9c2da"
  ctx.font = "bold 20px sans-serif"
  ctx.textAlign = "left"
  ctx.fillText(favoriteResult.kicker, margin, 620)
  ctx.textAlign = "right"
  ctx.fillText(favoriteResult.footer, canvas.width - margin, 620)

  await downloadBoardPng(canvas, "stella-sora-favorite-trekkers.png")
}
