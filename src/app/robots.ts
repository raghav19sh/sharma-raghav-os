import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/adminrs", "/api/v1/admin"] }], sitemap: "https://sharma-raghav.com/sitemap.xml" };
}
