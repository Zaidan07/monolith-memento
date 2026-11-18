import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Footer, Header } from "../components/site-chrome"
import "./globals.css"

export const metadata: Metadata = {
  title: { default: "Stella Sora Pick", template: "%s | Stella Sora Pick" },
  description: "Fan-made tools to pick, rank, and celebrate your favorite Trekkers in Stella Sora.",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
