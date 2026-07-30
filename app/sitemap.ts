import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://afrid.io";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/login",
    "/signup",
    "/join",
    "/contribute",
    "/dashboard",
    "/record",
    "/submissions",
    "/wallet",
    "/profile",
    "/validator",
    "/reviewer",
    "/turing-test",
    "/turing-test-payouts",
    "/settings/legal",
  ];

  const now = new Date();

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/login" || route === "/signup" ? 0.9 : 0.7,
  }));
}
