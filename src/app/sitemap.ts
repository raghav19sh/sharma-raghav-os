import type { MetadataRoute } from "next";

const base = "https://sharma-raghav.com";
const routes = ["/", "/about", "/research", "/knowledge", "/engineering", "/security-lab", "/soc", "/observatory", "/timeline", "/journal", "/reading-room", "/learning-hub", "/media-library", "/developer-workspace", "/ai-terminal", "/public-api", "/settings", "/now", "/changelog", "/docs", "/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({ url: `${base}${path}`, changeFrequency: path === "/" ? "weekly" : "monthly", priority: path === "/" ? 1 : 0.6 }));
}
