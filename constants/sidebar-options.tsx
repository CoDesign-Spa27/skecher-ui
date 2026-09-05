import { COMPONENT_DOCS } from "@/lib/docs-content";
import type { SidebarItemProps } from "@/types/docs/sidebar-types";

const COMPONENT_GROUPS = [
  {
    title: "Text & Typography",
    slugs: ["streaming-text", "text-morphing", "snap-text", "scroll-reveal-text"],
  },
  {
    title: "Images & Media",
    slugs: [
      "image-glide",
      "image-density-grid",
      "liquid-morphology-slideshow",
      "magazine-scroller",
    ],
  },
  {
    title: "Actions & Navigation",
    slugs: [
      "morphing-action-dock",
      "gooey-toolbar",
      "dock",
      "expandable-mobile-nav",
      "apple-mail-tabs",
      "velocity-tabs",
      "add-to-cart",
    ],
  },
  {
    title: "AI Interfaces",
    slugs: ["ai-chat-box", "ai-orb"],
  },
  {
    title: "Surfaces & Effects",
    slugs: [
      "liquid-glass-social",
      "dither-credit-card",
      "sliding-panel",
      "interactive-grid-hero",
      "morph-stack",
    ],
  },
] as const;

const pagesBySlug = new Map(COMPONENT_DOCS.map((page) => [page.slug, page]));
const categorizedSlugs = new Set<string>(COMPONENT_GROUPS.flatMap((group) => group.slugs));

function createComponentLink(slug: string): SidebarItemProps | null {
  const page = pagesBySlug.get(slug);

  if (!page) {
    return null;
  }

  return {
    badge: page.sidebarBadge,
    title: page.title,
    url: `/docs/${page.slug}`,
  };
}

const categorizedOptions = COMPONENT_GROUPS.flatMap((group) => {
  const links = group.slugs
    .map((slug) => createComponentLink(slug))
    .filter((item): item is SidebarItemProps => item !== null);

  if (links.length === 0) {
    return [];
  }

  return [{ title: group.title, type: "section" as const, count: links.length }, ...links];
});

const uncategorizedOptions = COMPONENT_DOCS.filter((page) => !categorizedSlugs.has(page.slug)).map(
  (page) => ({
    badge: page.sidebarBadge,
    title: page.title,
    url: `/docs/${page.slug}`,
  }),
);

export const SIDEBAR_OPTIONS: SidebarItemProps[] = [
  { title: "Getting Started", type: "section", count: 1 },
  { title: "Introduction", url: "/docs" },
  ...categorizedOptions,
  ...(uncategorizedOptions.length > 0
    ? [
        { title: "More", type: "section" as const, count: uncategorizedOptions.length },
        ...uncategorizedOptions,
      ]
    : []),
];
