import { ArrowDown, ArrowUpRight, ArrowLeftRight, Grid2X2, Heart, IdCard, ListOrdered, Sparkles, Trophy } from "lucide-react"
import { findMoment } from "../lib/moments"
import { MomentImage } from "../components/moment-card"
import { HeroCarousel } from "../components/hero-carousel"
import "./hero-carousel.css"
import "./tool-preview.css"
import { ToolPreview, type PreviewKind } from "../components/tool-preview"
import Link from "next/link"
import { getTrekkerCount } from "../lib/supabase"

export const dynamic = "force-dynamic"

const tools = [
  { title: "Favorite Trekkers", href: "/favorite-trekkers", description: "Pick one favorite for each of the six elements.", icon: Heart, preview: "favorites" as PreviewKind, tone: "pink" },
  { title: "Trekker Bingo", href: "/bingo", description: "Fill a 5 × 5 board with your Trekker picks.", icon: Grid2X2, preview: "bingo" as PreviewKind, tone: "blue" },
  { title: "Top 9 Trekkers", href: "/top-nine", description: "Rank the nine Trekkers you like the most.", icon: ListOrdered, preview: "top9" as PreviewKind, tone: "gold" },
  { title: "First Impression vs Now", href: "/first-impression", description: "Compare what you thought then with how you feel now.", icon: ArrowLeftRight, preview: "impression" as PreviewKind, tone: "purple" },
  { title: "Novaria Profile", href: "/profile", description: "Tell your Stella Sora story in nine answers.", icon: IdCard, preview: "profile" as PreviewKind, tone: "mint" },
  { title: "Leaderboard", href: "/leaderboard", description: "See which Trekkers lead the community picks.", icon: Trophy, preview: "leaderboard" as PreviewKind, tone: "peach" },
  { title: "Moment with YOU.", href: "/moments", description: "Pull and collect Trekker Memory Snapshots.", icon: Sparkles, preview: "moments" as const, tone: "purple" },
]

export default async function Home() {
  const count = await getTrekkerCount()

  const leafia = findMoment("leafia")

  return (
    <main className="shell">
      <section className="hero carousel-hero" aria-labelledby="hero-title">
        <HeroCarousel>
          <div className="hero-copy">
            <p className="hero-label"><Sparkles size={15} aria-hidden="true" /> A Stella Sora fan project</p>
            <h1 id="hero-title">Tyrant,<br /><em>want to tell about your day?</em></h1>
            <p className="hero-description">Pick your favorite Trekkers, rank your lineup, and make a piece of Novaria your own.</p>
            <a className="hero-button" href="#tools">Explore tools <ArrowDown size={17} aria-hidden="true" /></a>
          </div>
        </HeroCarousel>
      </section>
      <section className="tools-section" id="tools" aria-labelledby="tools-title">
        <div className="section-heading">
          <h2 id="tools-title">Pick your tool</h2>
          {count !== null && <p className="roster-count"><span />{`${count} Trekkers in the roster`}</p>}
        </div>
        <ul className="tool-grid">
          {tools.map(({ title, href, description, icon: Icon, tone, preview }) => (
            <li key={href}>
              <Link className={`tool-card ${tone}`} href={href}>
                {preview === "moments" ? (
                  <div className="tool-preview tool-preview-moments">{leafia && <MomentImage moment={leafia} preview />}</div>
                ) : <ToolPreview kind={preview} />}
                <div className="tool-card-copy">
                  <span className="tool-icon"><Icon size={23} aria-hidden="true" /></span>
                  <ArrowUpRight className="tool-arrow" size={19} aria-hidden="true" />
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
