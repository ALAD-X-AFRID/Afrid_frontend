import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AFRID — The Foundation of Sovereign Intelligence",
    short_name: "AFRID",
    description:
      "An infrastructure-grade data refinery that turns Africa's rich, multi-modal human data into production-grade AI assets.",
    start_url: "/",
    display: "standalone",
    background_color: "#03040d",
    theme_color: "#39e0ff",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
