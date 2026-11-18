import { ArrowUpRight, Orbit } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function Header() {
  return (
    <header className="site-header">
      <div className="shell flex items-center justify-between gap-4">
        <Link className="brand" href="/">
          {/* <span className="brand-icon"><Orbit size={22} aria-hidden="true" /></span> */}
          <Image src="/art/icon.png" width={22} height={22} alt=""/>
          Monolith <strong>Memento</strong>
        </Link>
        <nav className="flex items-center gap-5 sm:gap-8" aria-label="Main navigation">
          <Link href="/#tools">Tools</Link>
          <Link href="/credits">Credits <ArrowUpRight size={13} aria-hidden="true" /></Link>
        </nav>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-columns">
        <p className="footer-notice">Unofficial fan site · Non-commercial</p>
        <p className="footer-attribution">
          Stella Sora and game assets: © Yostar. All Rights Reserved. Inspired by 키보토스 픽 — <a href="https://blue-archive-pick.vercel.app/">blue-archive-pick.vercel.app</a>. Character data &amp; images via StellaSoraAPI by torikushiii.
        </p>
        <div className="footer-links">
          <nav aria-label="Footer links">
            <a href="https://api.ennead.cc/stella/">Image source</a>
            <a href="https://stellasora.jp/fankit">Official fan kit</a>
            <Link href="/credits">Credits</Link>
          </nav>
          <p>Made by MasDan v0.1.0</p>
        </div>
      </div>
    </footer>
  )
}
