import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/a-casa", "/os-quartos", "/reservar", "/privacidade"].map((c) => ({ url: `${SITE}${c === "/" ? "" : c}`, lastModified: new Date() }));
}
