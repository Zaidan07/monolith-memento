import { trekkerFullArt } from "./trekker-full-art"
import { getImageProps } from "next/image"
import { trekkerImage, type Trekker } from "./trekkers"

export async function loadPortrait(trekker?: Trekker) {
  const url = trekker && trekkerImage(trekker.image_url)
  if (!url) return null

  const { props } = getImageProps({ src: url, alt: "", width: 128, height: 128 })
  const image = new Image()
  image.src = props.src
  try {
    await image.decode()
    return image
  } catch {
    return null
  }
}

export async function loadFullPortrait(trekker?: Trekker) {
  const source = trekkerFullArt(trekker)
  if (!source) return null
  const image = new Image()
  image.src = source
  try {
    await image.decode()
    return image
  } catch {
    return null
  }
}

export function drawContainedPortrait(
  ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number
) {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight)
  const artWidth = image.naturalWidth * scale
  const artHeight = image.naturalHeight * scale
  ctx.drawImage(image, x + (width - artWidth) / 2, y + (height - artHeight) / 2, artWidth, artHeight)
}

export const boardCredit = "stella-sora-pick • Inspired by Kivotos Pick • Data: StellaSoraAPI"

export async function downloadBoardPng(canvas: HTMLCanvasElement, filename: string) {
  const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
  if (!png) throw new Error("Could not encode PNG.")
  const url = URL.createObjectURL(png)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 30000)
}
