export type ComponentDoc = {
  id: string;
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
  usage: {
    imports: string;
    code: string;
  };
  files: {
    path: string;
    description?: string;
  }[];
};

export const COMPONENT_DOCS: ComponentDoc[] = [
  {
    id: "streaming-text",
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
    usage: {
      imports: `import { BlurredText } from "@/components/ui/streaming-text";`,
      code: `<BlurredText
  text="Stop acting as if life is a rehearsal."
  className="text-4xl font-medium"
/>`,
    },
    files: [
      {
        path: "components/ui-components/streaming-text.tsx",
        description: "Animated text component",
      },
    ],
  },
   {
    id: "text-morphing",
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
    usage: {
      imports: `import { MorphingText } from "@/components/ui/text-morphing";`,
      code: `<MorphingText
  texts={[
    "AI begins analyzing your data...",
    "Processing information and finding patterns...",
    "Generating intelligent responses...",
  ]}
  className="text-4xl font-medium"
/>`,
    },
    files: [
      {
        path: "components/ui-components/text-morphing.tsx",
        description: "Morphing text component",
      },
    ],
  },
  {
    id: "liquid-glass-social",
    title: "Liquid Glass Social",
    slug: "liquid-glass-social",
    eyebrow: "Components",
    description:
      "A polished animated UI primitive for expressive product interfaces.",
    details: [],
    dependencies: ["react", "motion"],
    installDependencies: ["motion"],
    cliCommand: "https://skecher-ui.vercel.app/r/liquid-glass-social.json",
    importName: "Social",
    usage: {
      imports: `import { Social } from "@/components/ui/liquid-glass-social";`,
      code: `<Social />`,
    },
    files: [
      {
        path: "components/ui-components/liquid-glass-social.tsx",
        description: "Liquid Glass Social component",
      },
    ],
  }
];

export function getComponentDoc(slug: string) {
  return COMPONENT_DOCS.find((page) => page.slug === slug);
}
