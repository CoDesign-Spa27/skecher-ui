export type ComponentDoc = {
  title: string;
  slug: string;
  eyebrow: string;
  description: string;
};

export const COMPONENT_DOCS: ComponentDoc[] = [
  {
    title: "Streaming Text",
    slug: "streaming-text",
    eyebrow: "Components",
    description:
      "A soft word-by-word text reveal for hero copy, onboarding moments, empty states, and editorial interfaces that need a polished animated entrance.",
  },
];

export function getComponentDoc(slug: string) {
  return COMPONENT_DOCS.find((page) => page.slug === slug);
}

