import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "Sharma-Raghav OS", short_name: "SR OS", description: "Personal cybersecurity and knowledge operating system.", start_url: "/", display: "standalone", background_color: "#F4EFE6", theme_color: "#72263A", icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }] };
}
