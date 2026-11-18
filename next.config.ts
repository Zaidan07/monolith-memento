import type { NextConfig } from "next"

const config: NextConfig = {
  images: {
    remotePatterns: [
      ...(process.env.NEXT_PUBLIC_SUPABASE_URL ? ["hero", "trekkers", "badges", "elements", "moments"].map((bucket) => new URL(`/storage/v1/object/public/${bucket}/**`, process.env.NEXT_PUBLIC_SUPABASE_URL)) : []),
      { protocol: "https", hostname: "api.ennead.cc", pathname: "/stella/assets/**", search: "" },
      { protocol: "https", hostname: "hyufxwonpybhjmhyifzv.supabase.co", pathname: "/storage/v1/object/public/trekkers/**", search: "" },
    ],
  },
}

export default config
