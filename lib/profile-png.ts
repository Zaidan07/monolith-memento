import { elementStripe } from "./trekker-full-art"
import { boardCredit, downloadBoardPng, drawContainedPortrait, loadFullPortrait, loadPortrait } from "./board-png"
import { guildRunes, honorBanner, officialElementIcon } from "./profile-catalog"
import { elementSymbols } from "./favorite-result"
import { profileFields, type Profile } from "./profile"
import type { Element, Trekker } from "./trekkers"

function wrapAnswer(ctx: CanvasRenderingContext2D, answer: string, width: number) {
  const lines: string[] = []
  let line = ""
  for (const character of answer) {
    if (ctx.measureText(line + character).width > width) {
      const gap = line.lastIndexOf(" ")
      lines.push(gap > 0 ? line.slice(0, gap) : line)
      line = gap > 0 ? line.slice(gap + 1) : ""
    }
    line += character
  }
  return [...lines, line]
}

async function loadProfileAsset(url: string | null) {
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

export async function exportProfilePng(profile: Profile, roster: Trekker[]) {
  const favorite = roster.find(({ id }) => id === profile.favoriteTrekkerId)
  const core = profile.game.core.map((slot) => ({ ...slot, trekker: roster.find(({ id }) => id === slot.id) }))
  const [portrait, ...corePortraits] = await Promise.all([loadPortrait(favorite), ...core.map(({ trekker }) => loadFullPortrait(trekker))])
  const { game } = profile
  const [banner, favoriteElementIcon, ...coreIcons] = await Promise.all([
    loadProfileAsset(honorBanner(game.badge)),
    loadProfileAsset(profile.favoriteElement ? officialElementIcon(profile.favoriteElement as Element) : null),
    ...core.map(({ trekker }) => loadProfileAsset(trekker ? officialElementIcon(trekker.element) : null)),
  ])
  await document.fonts.load('35px "Noto Sans Runic"').catch(() => undefined)
  const canvas = document.createElement("canvas")
  canvas.width = 1200
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas is unavailable.")

  ctx.font = "26px sans-serif"
  const answers = profileFields.map(({ key }) => {
    const answer = (key === "favoriteTrekkerId" ? favorite?.name : profile[key]) || "—"
    return wrapAnswer(ctx, answer, 322)
  })
  const rowHeights = Array.from({ length: 3 }, (_, row) => Math.max(208,
    ...answers.slice(row * 3, row * 3 + 3).map((lines, col) => {
      const baseline = row === 0 && col === 1 && portrait ? 157 : 81
      return baseline + (lines.length - 1) * 29 + 26
    })))
  const aboutTop = 1100
  canvas.height = aboutTop + rowHeights.reduce((sum, height) => sum + height + 14, 0) + 60

  ctx.fillStyle = "#eff1fe"
  ctx.fillRect(0, 0, 1200, canvas.height)
  ctx.fillStyle = "#d8e7ee"
  ctx.fillRect(28, 24, 1144, 970)
  ctx.fillStyle = "#203967"
  ctx.fillRect(48, 42, 1104, 60)
  ctx.fillStyle = "#fff"
  ctx.font = '35px "Noto Sans Runic", sans-serif'
  ctx.fillText(guildRunes(game.guild) || "—", 68, 84, 590)
  ctx.textAlign = "right"
  ctx.font = "bold 25px sans-serif"
  ctx.fillText("UID: " + (game.uid || game.webUid || "—"), 1130, 82)
  ctx.textAlign = "left"
  ctx.fillStyle = "#fff"
  ctx.fillRect(48, 102, 1104, 244)
  ctx.fillStyle = "#a8bed7"
  ctx.fillRect(68, 120, 154, 154)
  if (portrait) ctx.drawImage(portrait, 68, 120, 154, 154)
  if (game.level) {
    ctx.fillStyle = "#fff"
    ctx.beginPath()
    ctx.arc(92, 145, 24, 0, 2 * Math.PI)
    ctx.fill()
    ctx.fillStyle = "#203967"
    ctx.font = "bold 20px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(game.level, 92, 145)
    ctx.font = "11px sans-serif"
    ctx.fillText("Lv.", 92, 159)
    ctx.textAlign = "left"
  }
  ctx.fillStyle = "#e7eff5"
  ctx.fillRect(243, 123, 884, 68)
  ctx.fillRect(243, 201, 884, 58)
  ctx.fillStyle = "#203967"
  ctx.font = "bold 43px sans-serif"
  ctx.fillText(profile.displayName, 260, 172, 850)
  ctx.font = "bold 30px sans-serif"
  ctx.fillText(game.title || "—", 260, 239, 850)
  const badges = [
    { text: game.badge, image: banner, full: true },
    { text: profile.favoriteElement, image: favoriteElementIcon, full: false },
    { text: profile.startedPlaying, image: null, full: false },
  ].filter(({ text }) => text)
  badges.forEach(({ text, image, full }, index) => {
    const x = 68 + index * 352
    ctx.fillStyle = "#285d9e"
    ctx.fillRect(x, 292, 334, 38)
    ctx.fillStyle = "#fff"
    ctx.font = "bold 22px sans-serif"
    if (image && full) {
      const width = Math.min(334, 52 * image.naturalWidth / image.naturalHeight)
      ctx.drawImage(image, x + (334 - width) / 2, 285, width, width * image.naturalHeight / image.naturalWidth)
    } else {
      if (image) ctx.drawImage(image, x + 7, 299, 23, 23)
      ctx.fillText(text, x + (image ? 36 : 11), 318, image ? 285 : 310)
    }
  })
  ctx.fillStyle = "#fff"
  ctx.fillRect(48, 360, 1104, 84)
  ctx.fillStyle = "#203967"
  ctx.font = "bold 28px sans-serif"
  ctx.fillText(game.motto || "—", 68, 412, 1050)
  ctx.fillRect(48, 458, 1104, 49)
  ctx.fillStyle = "#fff"
  ctx.fillText("Guild Core Member", 68, 492)
  core.forEach(({ trekker, level }, index) => {
    const x = 68 + index * 360
    const y = 526
    const image = corePortraits[index]
    ctx.fillStyle = "#a8bed7"
    const cardWidth = 344
    const cardHeight = Math.round(cardWidth * 4 / 3)
    const stripeHeight = 15
    const captionY = y + cardHeight - stripeHeight - 46
    ctx.fillRect(x, y, cardWidth, cardHeight)
    if (image) {
      drawContainedPortrait(ctx, image, x, y, cardWidth, cardHeight)
    } else if (trekker) {
      ctx.fillStyle = "#203967"
      ctx.font = "bold 42px sans-serif"
      ctx.fillText(trekker.name.slice(0, 2).toUpperCase(), x + 145, y + 151)
    }
    if (trekker) {
      const icon = coreIcons[index]
      const symbol = elementSymbols[trekker.element]
      ctx.fillStyle = "#203967"
      ctx.fillRect(x + 6, y + 6, 39, 39)
      ctx.save()
      ctx.translate(x + 12, y + 12)
      ctx.strokeStyle = symbol.color
      ctx.lineWidth = 2
      if (icon) ctx.drawImage(icon, 0, 0, 24, 24)
      else ctx.stroke(new Path2D(symbol.path))
      ctx.restore()
    }
    ctx.fillStyle = "#203967"
    ctx.fillRect(x, captionY, cardWidth, 46)
    ctx.fillStyle = "#fff"
    ctx.font = "bold 24px sans-serif"
    ctx.textAlign = "right"
    ctx.fillText(trekker?.name || "Empty", x + 332, captionY + 31, 220)
    ctx.textAlign = "left"
    if (level && trekker) {
      ctx.fillStyle = "#ffdf77"
      ctx.fillText("Lv." + level, x + 12, captionY + 31, 95)
    }
    const stripe = ctx.createLinearGradient(x, 0, x + 344, 0)
    const [stripeStart, stripeEnd] = elementStripe[trekker?.element ?? "Lux"]
    stripe.addColorStop(0, stripeStart)
    stripe.addColorStop(1, stripeEnd)
    ctx.fillStyle = stripe
    ctx.fillRect(x, y + cardHeight - stripeHeight, cardWidth, stripeHeight)
  })
  ctx.fillStyle = "#203967"
  ctx.font = "bold 42px sans-serif"
  ctx.fillText("About", 48, 1073)
  profileFields.forEach(({ key, label }, index) => {
    const x = 48 + (index % 3) * 372
    const row = Math.floor(index / 3)
    const y = aboutTop + rowHeights.slice(0, row).reduce((sum, height) => sum + height + 14, 0)
    ctx.fillStyle = "#fff"
    ctx.fillRect(x, y, 360, rowHeights[row])
    ctx.fillStyle = "#514eb1"
    ctx.font = "bold 24px sans-serif"
    ctx.fillText(label, x + 19, y + 39)
    let baseline = y + 81
    if (key === "favoriteTrekkerId" && portrait) {
      ctx.drawImage(portrait, x + 19, y + 54, 72, 72)
      baseline = y + 157
    }
    ctx.fillStyle = "#222854"
    ctx.font = "26px sans-serif"
    answers[index].forEach((line, row) => ctx.fillText(line, x + 19, baseline + 29 * row, 322))
  })
  ctx.fillStyle = "#505778"
  ctx.font = "22px sans-serif"
  ctx.fillText(boardCredit, 48, canvas.height - 26)
  await downloadBoardPng(canvas, "stella-sora-novaria-profile.png")
}
