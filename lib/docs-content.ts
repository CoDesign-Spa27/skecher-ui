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
    details: [],
    dependencies: ["react", "motion"],
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
    details: [],
    dependencies: ["react", "motion"],
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
  },
  {
    id: "image-glide",
    title: "Image Glide",
    slug: "image-glide",
    eyebrow: "Components",
    description:
      "A clean image interaction component with pointer depth, soft image transitions, and a compact thumbnail rail.",
    details: [
      {
        title: "Pointer depth",
        body: "The preview surface tilts and pans the active image with direct transform updates for a responsive, decorative interaction.",
      },
      {
        title: "Soft switching",
        body: "Image changes use short opacity and blur transitions so the selection feels polished without slowing the user down.",
      },
      {
        title: "Motion aware",
        body: "The component respects reduced motion by removing pointer movement while keeping a gentle opacity transition.",
      },
    ],
    dependencies: ["react", "motion"],
    installDependencies: ["motion"],
    cliCommand: "https://skecher-ui.vercel.app/r/image-glide.json",
    importName: "ImageGlide",
    usage: {
      imports: `import { ImageGlide } from "@/components/ui/image-glide";`,
      code: `<ImageGlide />`,
    },
    files: [
      {
        path: "components/ui-components/image-glide.tsx",
        description: "Image Glide component",
      },
    ],
  },
  {
    id: "image-density-grid",
    title: "Image Density Grid",
    slug: "image-density-grid",
    eyebrow: "Components",
    description:
      "A percentage-controlled image grid that reflows every frame into a denser or sparser layout with layout motion, soft blur, and a temporary glow during density changes.",
    details: [],
    dependencies: ["react", "motion"],
    installDependencies: ["motion"],
    cliCommand: "https://skecher-ui.vercel.app/r/image-density-grid.json",
    importName: "ImageDensityGrid",
    usage: {
      imports: `import { ImageDensityGrid } from "@/components/ui/image-density-grid";`,
      code: `<ImageDensityGrid />`,
    },
    files: [
      {
        path: "components/ui-components/image-density-grid.tsx",
        description: "Image Density Grid component",
      },
    ],
  },
  {
    id: "morphing-action-dock",
    title: "Morphing Action Dock",
    slug: "morphing-action-dock",
    eyebrow: "Components",
    description:
      "A floating action dock that merges into one compact surface and splits into contextual actions on hover, focus, or pin.",
    details: [],
    dependencies: ["react", "motion", "lucide-react"],
    installDependencies: ["motion", "lucide-react"],
    cliCommand: "https://skecher-ui.vercel.app/r/morphing-action-dock.json",
    importName: "MorphingActionDock",
    usage: {
      imports: `import { MorphingActionDock } from "@/components/ui/morphing-action-dock";`,
      code: `<MorphingActionDock />`,
    },
    files: [
      {
        path: "components/ui-components/morphing-action-dock.tsx",
        description: "Morphing Action Dock component",
      },
    ],
  },
  {
    id: "gooey-toolbar",
    title: "Gooey Toolbar",
    slug: "gooey-toolbar",
    eyebrow: "Components",
    description:
      "A polished animated UI primitive for expressive product interfaces.",
    details: [],
    dependencies: ["react", "motion"],
    installDependencies: [
      "motion",
      "nucleo-ui-essential-fill-duo-18",
      "tailwind-merge",
      "clsx",
    ],
    cliCommand: "https://skecher-ui.vercel.app/r/gooey-toolbar.json",
    importName: "AmoebaFab",
    usage: {
      imports: `import { AmoebaFab } from "@/components/ui/gooey-toolbar";`,
      code: `<AmoebaFab />`,
    },
    files: [
      {
        path: "components/ui-components/gooey-toolbar.tsx",
        description: "Gooey Toolbar component",
      },
    ],
  },
  {
    id: "dock",
    title: "Dock",
    slug: "dock",
    eyebrow: "Components",
    description:
      "A macOS-style magnifying dock powered by shared motion values and spring-smoothed icon sizing.",
    details: [
      {
        title: "Shared cursor signal",
        body: "A single mouseX motion value is passed to every item so icon sizing is derived without React re-rendering on pointer movement.",
      },
      {
        title: "Spring magnification",
        body: "Each item maps cursor distance into a target size and smooths the result through a compact spring for continuous, interruptible motion.",
      },
      {
        title: "Motion aware",
        body: "Reduced-motion users keep the resting item size while preserving focus and tooltip feedback.",
      },
    ],
    dependencies: ["react", "motion"],
    installDependencies: ["motion"],
    cliCommand: "https://skecher-ui.vercel.app/r/dock.json",
    importName: "Dock",
    usage: {
      imports: `import { Dock } from "@/components/ui/dock";`,
      code: `<Dock
  items={[
    { id: "home", label: "Home", icon: <HomeIcon /> },
    { id: "search", label: "Search", icon: <SearchIcon /> },
  ]}
/>`,
    },
    files: [
      {
        path: "components/ui-components/dock.tsx",
        description: "Magnifying dock component",
      },
    ],
  },
  {
    id: "liquid-morphology-slideshow",
    title: "Liquid Morphology",
    slug: "liquid-morphology-slideshow",
    eyebrow: "Components",
    description:
      "A WebGL image slideshow for landing-page backgrounds with liquid glass, frost, ripple, plasma, and timeshift shader transitions.",
    details: [
      {
        title: "Shader transitions",
        body: "The component lazy-loads Three.js on the client and drives texture transitions through a scoped WebGL canvas.",
      },
      {
        title: "Background ready",
        body: "Counters, slide navigation, click advance, keyboard controls, and help text can be toggled for full-bleed hero use or quiet decorative backgrounds.",
      },
      {
        title: "Motion aware",
        body: "Reduced-motion users get static image changes and autoplay is disabled to avoid continuous background movement.",
      },
    ],
    dependencies: ["react"],
    cliCommand:
      "https://skecher-ui.vercel.app/r/liquid-morphology-slideshow.json",
    importName: "LiquidMorphologySlideshow",
    usage: {
      imports: `import { LiquidMorphologySlideshow } from "@/components/ui/liquid-morphology-slideshow";`,
      code: `<LiquidMorphologySlideshow
  className="absolute inset-0 h-full rounded-none"
  showNavigation={false}
  showCounters={false}
/>`,
    },
    files: [
      {
        path: "components/ui-components/liquid-morphology-slideshow.tsx",
        description: "Liquid Morphology Slideshow component",
      },
    ],
  },
  {
    id: "magazine-scroller",
    title: "Magazine Scroller",
    slug: "magazine-scroller",
    eyebrow: "Components",
    description:
      "A polished animated UI primitive for expressive product interfaces.",
    details: [],
    dependencies: ["react", "motion"],
    installDependencies: [],
    cliCommand: "https://skecher-ui.vercel.app/r/magazine-scroller.json",
    importName: "MagazineScroller",
    usage: {
      imports: `import { MagazineScroller } from "@/components/ui/magazine-scroller";`,
      code: `<MagazineScroller />`,
    },
    files: [
      {
        path: "components/ui-components/magazine-scroller.tsx",
        description: "Magazine Scroller component",
      },
    ],
  },
  {
    id: "ai-chat-box",
    title: "Ai Chat Box",
    slug: "ai-chat-box",
    eyebrow: "Components",
    description:
      "A morphing AI chat composer with configurable models, actions, messages, labels, and controlled state hooks.",
    details: [
      {
        title: "Controlled or standalone",
        body: "Use the defaults for a self-contained chat, or control the input, selected model, and message collection from application state.",
      },
      {
        title: "Composable content",
        body: "Customize model metadata, composer actions, the empty state, localized labels, and message rendering without changing the component source.",
      },
      {
        title: "Accessible motion",
        body: "The model picker supports keyboard navigation and the shared-layout transitions respect the user's reduced-motion preference.",
      },
    ],
    dependencies: ["react", "lucide-react", "motion"],
    installDependencies: ["lucide-react", "motion"],
    cliCommand: "https://skecher-ui.vercel.app/r/ai-chat-box.json",
    importName: "AiChatBox",
    usage: {
      imports: `import { AiChatBox } from "@/components/ui/ai-chat-box";`,
      code: `<AiChatBox
  models={models}
  onSend={(message, model) => sendMessage(message.text, model?.id)}
/>`,
    },
    files: [
      {
        path: "components/ui-components/ai-chat-box.tsx",
        description: "Ai Chat Box component",
      },
    ],
  },
];

export function getComponentDoc(slug: string) {
  return COMPONENT_DOCS.find((page) => page.slug === slug);
}
