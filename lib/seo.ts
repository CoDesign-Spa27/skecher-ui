import type { Metadata } from "next";

const fallbackUrl = "https://skecher-ui.vercel.app";

export const siteConfig = {
  name: "Skecher UI",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? fallbackUrl,
  title: "Skecher UI - Motion Components for React",
  description:
    "Copy polished React motion components into your app with shadcn-compatible registry commands, source code, dependencies, and live previews.",
  githubUrl: "https://github.com/sketch-the-art/sketch-the-art",
  ogImage: "/og-image.png",
  keywords: [
    "Skecher UI",
    "React motion components",
    "shadcn registry",
    "shadcn components",
    "Motion React",
    "animated React components",
    "Tailwind CSS components",
    "component library",
  ],
} as const;

export const siteUrl = new URL(siteConfig.url);

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

type SeoMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function createMetadata({
  title = siteConfig.title,
  description = siteConfig.description,
  path = "/",
  keywords = [],
  noIndex = false,
}: SeoMetadataInput = {}): Metadata {
  const canonical = absoluteUrl(path);
  const metadataTitle = title === siteConfig.title ? title : `${title} | ${siteConfig.name}`;

  return {
    metadataBase: siteUrl,
    title: metadataTitle,
    description,
    keywords: [...siteConfig.keywords, ...keywords],
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    alternates: {
      canonical,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonical,
      siteName: siteConfig.name,
      title: metadataTitle,
      description,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} component library preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metadataTitle,
      description,
      images: [siteConfig.ogImage],
    },
  };
}

export function createSoftwareSourceCodeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: siteConfig.name,
    url: siteConfig.url,
    codeRepository: siteConfig.githubUrl,
    programmingLanguage: ["TypeScript", "TSX"],
    runtimePlatform: "React",
    description: siteConfig.description,
    applicationCategory: "DeveloperApplication",
  };
}

export function createWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/docs?component={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
