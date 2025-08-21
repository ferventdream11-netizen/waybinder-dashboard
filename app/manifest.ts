import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Waybinder Guest Guide",
    short_name: "Waybinder",
    description: "Offline-ready guest guide with PDF and QR stickers.",
    start_url: "/g/demo",
    display: "standalone",
    background_color: "#FAF8F6", // warm paper
    theme_color: "#11162A",      // midnight brand
    lang: "en",
  };
}
