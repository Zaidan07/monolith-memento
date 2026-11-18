// Hero carousel slides — Stella Sora Pick
// Generated 17 Nov 2026 ~20:20 WIB from live checks against https://api.ennead.cc/stella/
// Source of truth: Hiro420/StellaSoraData EN/bin/MainScreenCG.json + EN/language/en_US/MainScreenCG.json
// (133 titles; 104 have FullScreenImg). Availability probed live with Range requests:
// 93/104 return 200/206, 11 return 404 and are EXCLUDED below.
// Do NOT call the API live from the browser — sync these files once to Supabase Storage
// bucket `hero` (see spec Bagian 5b) and point image_url at Storage. Titles are English (en_US).

export type HeroSlide = {
  id: number;
  title: string;
  /** API path, e.g. CG/1002/1002 — full URL: https://api.ennead.cc/stella/assets/<asset> */
  asset: string;
  /** Small thumbnail asset from MainScreenCG ListImg, for previews */
  thumbAsset: string;
  sortOrder: number;
};

export const HERO_SLIDES: HeroSlide[] = [
  { id: 1002, title: 'Calibration', asset: 'CG/1002/1002', thumbAsset: 'Icon/CGHead/story_main_00_002_L', sortOrder: 1 },
  { id: 1008, title: 'The Awakening Reset', asset: 'CG/1008/1008', thumbAsset: 'Icon/CGHead/story_main_01_007_o_L', sortOrder: 2 },
  { id: 1016, title: 'Drive', asset: 'CG/1016/1016', thumbAsset: 'Icon/CGHead/story_main_01_025_L', sortOrder: 3 },
  { id: 1018, title: 'Daily Life in Emor 2', asset: 'CG/1018/1018', thumbAsset: 'Icon/CGHead/story_main_01_009_L', sortOrder: 4 },
  { id: 1020, title: 'City of a Thousand Monoliths', asset: 'CG/1020/1020', thumbAsset: 'Icon/CGHead/story_main_01_005_L', sortOrder: 5 },
  { id: 1023, title: 'Yesterday and the Far Away', asset: 'CG/1023/1023', thumbAsset: 'Icon/CGHead/story_main_01_012_L', sortOrder: 6 },
  { id: 1024, title: 'That Kid', asset: 'CG/1024/1024', thumbAsset: 'Icon/CGHead/story_main_01_027_L', sortOrder: 7 },
  { id: 1036, title: 'Blade of No-self', asset: 'CG/1036/1036', thumbAsset: 'Icon/CGHead/story_main_02_003_L', sortOrder: 8 },
  { id: 1039, title: 'The Wind on Waterway Bridge', asset: 'CG/1039/1039', thumbAsset: 'Icon/CGHead/story_main_02_009_L', sortOrder: 9 },
  { id: 1040, title: 'Lord of the Prize Claw', asset: 'CG/1040/1040', thumbAsset: 'Icon/CGHead/story_main_03_001_a_L', sortOrder: 10 },
];

export const heroImageUrl = (slide: HeroSlide) => {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  return base ? `${base}/storage/v1/object/public/hero/${slide.id}.png` : null;
};
