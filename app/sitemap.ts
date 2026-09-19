import type { MetadataRoute } from "next";

import { COMPONENT_DOCS } from "@/lib/docs-content";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/docs"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/docs/project-showcase"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/llms.txt"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/llms-full.txt"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    ...COMPONENT_DOCS.map((component) => ({
      url: absoluteUrl(`/docs/${component.slug}`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...COMPONENT_DOCS.map((component) => ({
      url: absoluteUrl(`/llms/${component.slug}`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
