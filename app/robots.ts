import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://afrid.io";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/record", "/submissions", "/wallet", "/profile", "/validator", "/reviewer", "/settings"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
