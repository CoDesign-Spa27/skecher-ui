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
  registry?: {
    namespace: string;
    url: string;
  };
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
    registry: {
      namespace: "@skecher-ui",
      url: "https://ui.sandeepsingh.dev/r/{name}.json",
    },
    cliCommand: "@skecher-ui/streaming-text",
    importName: "BlurredText",
    files: [
      {
        path: "components/ui-components/streaming-text.tsx",
        description: "Animated text component",
      },
    ],
  },
   {
    title: "Animated Slider",
    slug: "animated-slider",
    eyebrow: "Components",
    description:
      "A soft word-by-word text reveal for hero copy, onboarding moments, empty states, and editorial interfaces that need a polished animated entrance.",
    details: [
      {
        title: "Animated by word",
        body: "Each word fades in with a configurable blur reveal and staggered timing.",
      },
      {
        title: "Composable element",
        body: "Render the text as a paragraph, heading, or any other element through the as prop.",
      },
      {
        title: "Style friendly",
        body: "Pass wrapper and word classes to match the component to your layout and type system.",
      },
    ],
    dependencies: ["react","motion" ],
    installDependencies: ["motion"],
    registry: {
      namespace: "@skecher-ui",
      url: "https://ui.sandeepsingh.dev/r/{name}.json",
    },
    cliCommand: "@skecher-ui/streaming-text",
    importName: "BlurredText",
    files: [
      {
        path: "components/ui-components/streaming-text.tsx",
        description: "Animated text component",
      },
    ],
  },
];

export function getComponentDoc(slug: string) {
  return COMPONENT_DOCS.find((page) => page.slug === slug);
}
