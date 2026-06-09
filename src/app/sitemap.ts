import type { MetadataRoute } from "next";

const SITE_URL = "https://myteampredictions.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/norway`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/sweden`,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
}
