import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://gobluebunny.com").replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    host: siteUrl,
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
