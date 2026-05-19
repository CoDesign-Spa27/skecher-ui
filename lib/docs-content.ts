export type ComponentDoc = {
  title: string;
  slug: string;
  eyebrow: string;
  description: string;
  details: {
    title: string;
    body: string;
  }[];
  dependencies: string[];
  installDependencies?: string[];
  cliCommand: string;
  importName: string;
  files: {
    path: string;
    description?: string;
  }[];
};

export const COMPONENT_DOCS: ComponentDoc[] = [
  {
    title: "Streaming Text",
    slug: "streaming-text",
    eyebrow: "Components",
    description:
      "A soft word-by-word text reveal for hero copy, onboarding moments, empty states, and editorial interfaces that need a polished animated entrance.",
    details: [
      // {
      //   title: "Animated by word",
      //   body: "Each word fades in with a configurable blur reveal and staggered timing.",
      // },
      // {
      //   title: "Composable element",
      //   body: "Render the text as a paragraph, heading, or any other element through the as prop.",
      // },
      // {
      //   title: "Style friendly",
      //   body: "Pass wrapper and word classes to match the component to your layout and type system.",
      // },
    ],
    dependencies: ["react","motion" ],
    installDependencies: ["motion"],
    cliCommand: "https://skecher-ui.vercel.app/r/streaming-text.json",
    importName: "BlurredText",
    files: [
      {
        path: "components/ui-components/streaming-text.tsx",
        description: "Animated text component",
      },
    ],
  },
   {
    title: "Morphing Text",
    slug: "text-morphing",
    eyebrow: "Components",
    description:
      "A text morphing effect for hero copy, onboarding moments, empty states, and editorial interfaces that need a polished animated entrance.",
    details: [
      // {
      //   title: "Animated by character",
      //   body: "Each character fades in with a configurable blur reveal and staggered timing.",
      // },
    ],
    dependencies: ["react","motion" ],
    installDependencies: ["motion"],
    cliCommand: "https://skecher-ui.vercel.app/r/text-morphing.json",
    importName: "MorphingText",
    files: [
      {
        path: "components/ui-components/text-morphing.tsx",
        description: "Morphing text component",
      },
    ],
  },
];

export function getComponentDoc(slug: string) {
  return COMPONENT_DOCS.find((page) => page.slug === slug);
}
