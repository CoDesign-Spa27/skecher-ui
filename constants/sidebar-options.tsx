import { COMPONENT_DOCS } from "@/lib/docs-content";
import type { SidebarCategory, SidebarItemProps } from "@/types/docs/sidebar-types";

const COMPONENT_GROUPS = [
  {
    title: "Shaders",
    slugs: ["ai-orb", "dither-credit-card", "interactive-grid-hero"],
  },
  {
    title: "Carousels",
    slugs: [
      "image-glide",
      "image-density-grid",
      "liquid-morphology-slideshow",
      "magazine-scroller",
      "3d-wheel-carousel",
    ],
  },
  {
    title: "Interfaces",
    slugs: [
      "liquid-glass-social",
      "morphing-action-dock",
      "gooey-toolbar",
      "dock",
      "expandable-mobile-nav",
      "apple-mail-tabs",
      "velocity-tabs",
      "add-to-cart",
      "morph-menu",
      "ai-chat-box",
      "sliding-panel",
      "spring-slider",
    ],
  },
  {
    title: "Arts",
    slugs: ["streaming-text", "text-morphing", "snap-text", "scroll-reveal-text", "morph-stack"],
  },
] as const satisfies readonly { title: SidebarCategory; slugs: readonly string[] }[];

const pagesBySlug = new Map(COMPONENT_DOCS.map((page) => [page.slug, page]));
const categorizedSlugs = new Set<string>(COMPONENT_GROUPS.flatMap((group) => group.slugs));

function createComponentLink(slug: string): SidebarItemProps | null {
  const page = pagesBySlug.get(slug);

  if (!page) {
    return null;
  }

  return {
    badge: page.sidebarBadge,
    sketchId: page.sketchId,
    title: page.title,
    url: `/docs/${page.slug}`,
  };
}

export const SIDEBAR_CATEGORIES = COMPONENT_GROUPS.map((group) => ({
  title: group.title,
  items: group.slugs
    .map((slug) => createComponentLink(slug))
    .filter((item): item is SidebarItemProps => item !== null),
}));

const uncategorizedPages = COMPONENT_DOCS.filter((page) => !categorizedSlugs.has(page.slug));

if (uncategorizedPages.length > 0) {
  throw new Error(
    `Every component must belong to a sidebar category. Missing: ${uncategorizedPages
      .map((page) => page.slug)
      .join(", ")}`,
  );
}

export const SIDEBAR_CATEGORIES_OPTIONS: SidebarCategory[] = COMPONENT_GROUPS.map(
  (group) => group.title,
);
