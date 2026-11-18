import type { Metadata } from "next"

export const metadata: Metadata = { title: "Credits" }

export default function Credits() {
  return (
    <main className="shell text-page">
      <h1>Credits</h1>
      <ul>
        <li><strong>Inspiration / ide &amp; desain</strong><p><a href="https://blue-archive-pick.vercel.app/">키보토스 픽 (Kivotos Pick)</a> — fan project Blue Archive (favorite per sekolah, bingo, Top 9, first impression, profil). Web ini adalah adaptasi Stella Sora-nya, bukan clone.</p></li>
        <li><strong>Character data &amp; images API</strong><p><a href="https://api.ennead.cc/stella/">StellaSoraAPI by torikushiii</a> — repo: torikushiii/StellaSoraAPI (community, unofficial, datamined). Author yang sama dengan BlueArchiveAPI.</p></li>
        <li><strong>Game &amp; karakter</strong><p>Stella Sora © Yostar. All character art, names &amp; lore belong to Yostar.</p></li>
        <li><strong>Data pendukung / verifikasi roster</strong><p><a href="https://stella-sora.wiki">stella-sora.wiki</a>, <a href="https://gachawiki.info">gachawiki.info</a></p></li>
        <li><strong>Disclaimer</strong><p>This is a fan-made project for the community, not official, not affiliated with or endorsed by Yostar, Nexon, or Blue Archive.</p></li>
      </ul>
    </main>
  )
}
