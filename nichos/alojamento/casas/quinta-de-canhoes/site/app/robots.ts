import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/pedido", "/proposta", "/dev", "/api"] },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
