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
  usage: string;
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
    usage: `import { BlurredText } from "@/components/ui/streaming-text";

export default function StreamingTextExample() {
  return (
    <BlurredText
      as="h2"
      text="Build interfaces that feel as good as they look."
      className="max-w-3xl text-4xl font-semibold tracking-tight"
      wordClassName="mr-[0.25em]"
      staggerChildren={0.05}
      delayChildren={0.1}
      duration={0.3}
    />
  );
}`,
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
    usage: `import { MorphingText } from "@/components/ui/text-morphing";

const statusMessages = [
  "Analyzing your workspace...",
  "Finding useful patterns...",
  "Preparing your answer...",
];

export default function MorphingTextExample() {
  return (
    <MorphingText
      texts={statusMessages}
      interval={2400}
      className="text-3xl font-semibold tracking-tight"
    />
  );
}`,
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
    description: "A polished animated UI primitive for expressive product interfaces.",
    details: [],
    dependencies: ["react", "motion"],
    installDependencies: ["motion"],
    cliCommand: "https://skecher-ui.vercel.app/r/liquid-glass-social.json",
    importName: "Social",
    usage: `import { Social } from "@/components/ui/liquid-glass-social";

export default function SocialLinksExample() {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <Social />
    </div>
  );
}`,
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
    usage: `"use client";

import { useState } from "react";

import { ImageGlide } from "@/components/ui/image-glide";

const images = [
  {
    src: "/images/gallery/forest.jpg",
    alt: "Sunlight passing through a green forest",
    title: "Morning light",
    description: "A quiet trail at the start of the day.",
  },
  {
    src: "/images/gallery/coast.jpg",
    alt: "Rocky coastline beside a blue sea",
    title: "Open coast",
    description: "Wind and water shaping the shoreline.",
  },
  {
    src: "/images/gallery/desert.jpg",
    alt: "Soft desert dunes at sunset",
    title: "Last glow",
    description: "Warm light settling over the dunes.",
  },
];

export default function ImageGlideExample() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section aria-label="Featured photography">
      <ImageGlide
        images={images}
        initialIndex={activeIndex}
        onIndexChange={setActiveIndex}
        className="mx-auto max-w-5xl"
      />
    </section>
  );
}`,
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
    usage: `import { ImageDensityGrid } from "@/components/ui/image-density-grid";

const images = [
  { id: "one", src: "/images/gallery/one.jpg", alt: "Abstract blue artwork" },
  { id: "two", src: "/images/gallery/two.jpg", alt: "Red architectural detail" },
  { id: "three", src: "/images/gallery/three.jpg", alt: "Green landscape" },
  { id: "four", src: "/images/gallery/four.jpg", alt: "Monochrome portrait" },
];

export default function ImageDensityGridExample() {
  return (
    <ImageDensityGrid
      images={images}
      options={[20, 40, 80, 120]}
      initialPercent={40}
      title="Browse the collection"
      gridMaxHeight="42rem"
      showControls
      padded
      className="mx-auto max-w-6xl"
    />
  );
}`,
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
    usage: `"use client";

import { Compass, Feather, FlameKindling } from "lucide-react";

import { MorphingActionDock } from "@/components/ui/morphing-action-dock";

const actions = [
  {
    id: "explore",
    label: "Explore",
    icon: Compass,
    tone: "from-slate-950 via-slate-800 to-slate-700",
    eyebrow: "Find direction",
    paragraph: "Move from a broad idea to a clear next step.",
    cue: "Explore the workspace",
  },
  {
    id: "write",
    label: "Write",
    icon: Feather,
    tone: "from-neutral-950 via-neutral-800 to-stone-700",
    eyebrow: "Shape the draft",
    paragraph: "Turn the selected direction into useful copy.",
    cue: "Start a new draft",
  },
  {
    id: "launch",
    label: "Launch",
    icon: FlameKindling,
    tone: "from-zinc-950 via-zinc-800 to-orange-950",
    eyebrow: "Ship with confidence",
    paragraph: "Review the final details and publish your work.",
    cue: "Prepare the release",
  },
];

export default function MorphingActionDockExample() {
  return (
    <MorphingActionDock
      items={actions}
      defaultActiveId="explore"
      className="mx-auto max-w-4xl"
    />
  );
}`,
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
    description: "A polished animated UI primitive for expressive product interfaces.",
    details: [],
    dependencies: ["react", "motion"],
    installDependencies: ["motion", "nucleo-ui-essential-fill-duo-18", "tailwind-merge", "clsx"],
    cliCommand: "https://skecher-ui.vercel.app/r/gooey-toolbar.json",
    importName: "GooeyToolbar",
    usage: `import { GooeyToolbar } from "@/components/ui/gooey-toolbar";

export default function GooeyToolbarExample() {
  return (
    <div className="flex min-h-96 items-center justify-center">
      <GooeyToolbar
        defaultVariant="amoeba"
        showVariantToggle
        className="w-full max-w-xl"
      />
    </div>
  );
}`,
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
    usage: `"use client";

import { Bell, Home, Search, Settings } from "lucide-react";

import { Dock } from "@/components/ui/dock";

const iconClassName = "size-full";

export default function DockExample() {
  return (
    <Dock
      items={[
        { id: "home", label: "Home", icon: <Home className={iconClassName} /> },
        { id: "search", label: "Search", icon: <Search className={iconClassName} /> },
        {
          id: "notifications",
          label: "Notifications",
          icon: <Bell className={iconClassName} />,
          onClick: () => window.alert("Notifications opened"),
        },
        { id: "settings", label: "Settings", icon: <Settings className={iconClassName} /> },
      ]}
      baseSize={44}
      maxSize={76}
      influence={130}
      className="mx-auto"
    />
  );
}`,
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
    cliCommand: "https://skecher-ui.vercel.app/r/liquid-morphology-slideshow.json",
    importName: "LiquidMorphologySlideshow",
    usage: `import { LiquidMorphologySlideshow } from "@/components/ui/liquid-morphology-slideshow";

const slides = [
  {
    title: "Northern light",
    src: "/images/slides/northern-light.jpg",
    alt: "Green aurora over a mountain range",
    category: "Expedition",
    description: "Field journal",
  },
  {
    title: "Open water",
    src: "/images/slides/open-water.jpg",
    alt: "Sunlight reflecting across the ocean",
    category: "Travel",
    description: "Coastal study",
  },
];

export default function LiquidMorphologyExample() {
  return (
    <LiquidMorphologySlideshow
      slides={slides}
      effect="ripple"
      autoPlay
      interval={5000}
      transitionDuration={1.8}
      initialIndex={0}
      brandName="Northstar"
      navItems={[
        { label: "Work", href: "#work" },
        { label: "About", href: "#about" },
      ]}
      kicker="Selected journeys"
      headline="Stories shaped by light and motion."
      description="A cinematic collection of landscapes from around the world."
      ctaLabel="Explore the journal"
      ctaHref="#journal"
      clickToAdvance
      keyboardControls
      className="h-[42rem]"
    />
  );
}`,
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
    description: "A polished animated UI primitive for expressive product interfaces.",
    details: [],
    dependencies: ["react", "motion"],
    installDependencies: [],
    cliCommand: "https://skecher-ui.vercel.app/r/magazine-scroller.json",
    importName: "MagazineScroller",
    usage: `import { MagazineScroller } from "@/components/ui/magazine-scroller";

const covers = [
  { src: "/images/covers/edition-01.jpg", alt: "Edition 01 magazine cover" },
  { src: "/images/covers/edition-02.jpg", alt: "Edition 02 magazine cover" },
  { src: "/images/covers/edition-03.jpg", alt: "Edition 03 magazine cover" },
  { src: "/images/covers/edition-04.jpg", alt: "Edition 04 magazine cover" },
];

export default function MagazineScrollerExample() {
  return (
    <MagazineScroller
      images={covers}
      cardWidth={180}
      cardHeight={264}
      gap={32}
      slices={9}
      height={640}
      wheelSpeed={1.1}
      dragSpeed={1.1}
      bendStrength={82}
      maxBend={96}
      lockWheel={false}
      className="w-full"
    />
  );
}`,
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
    usage: `"use client";

import { Brain, Sparkles, Zap } from "lucide-react";
import { useState } from "react";

import {
  AiChatBox,
  type AiChatMessage,
  type AiChatModel,
} from "@/components/ui/ai-chat-box";

const models: AiChatModel[] = [
  {
    id: "balanced",
    name: "Balanced",
    description: "Useful for most everyday tasks",
    capability: "General",
    icon: Sparkles,
  },
  {
    id: "reasoning",
    name: "Reasoning",
    description: "Best for complex planning",
    capability: "Deep",
    icon: Brain,
  },
  {
    id: "fast",
    name: "Fast",
    description: "Quick drafts and summaries",
    capability: "Quick",
    icon: Zap,
  },
];

export default function AiChatBoxExample() {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);

  return (
    <AiChatBox
      models={models}
      messages={messages}
      onMessagesChange={setMessages}
      defaultSelectedModelId="balanced"
      onSend={(message, model) => {
        console.info("Send", message.text, "with", model?.name);
      }}
      labels={{
        empty: "What can I help you build?",
        input: "Describe your idea",
        send: "Send message",
      }}
      maxLength={2000}
      submitOnEnter
      className="mx-auto max-w-3xl"
    />
  );
}`,
    files: [
      {
        path: "components/ui-components/ai-chat-box.tsx",
        description: "Ai Chat Box component",
      },
    ],
  },
  {
    id: "ai-orb",
    title: "AI Orb",
    slug: "ai-orb",
    eyebrow: "Components",
    description:
      "A responsive circular Three.js plasma orb with a dark inner surface, ray-marched strands, configurable color and intensity, adjustable speed, and subtle pointer-driven movement.",
    details: [
      {
        title: "Ray-marched plasma strands",
        body: "A compact raymarch traces two bending wave fields, then blends configurable colors through their crossings and luminous edges.",
      },
      {
        title: "Responsive plasma depth",
        body: "Damped fine-pointer input offsets and rotates the field without interrupting its ambient motion or changing the component layout.",
      },
      {
        title: "Responsible ambient motion",
        body: "Rendering pauses off-screen and in background tabs, while reduced-motion users receive the same material as a still composition.",
      },
    ],
    dependencies: ["react", "three"],
    installDependencies: ["three"],
    cliCommand: "https://skecher-ui.vercel.app/r/ai-orb.json",
    importName: "AiOrb",
    usage: `import { AiOrb } from "@/components/ui/ai-orb";

export default function AiOrbExample() {
  return (
    <div className="flex min-h-96 items-center justify-center bg-neutral-950 p-8">
      <AiOrb
        ariaLabel="Animated purple and cyan AI plasma orb"
        primaryColor="#A855F7"
        secondaryColor="#06B6D4"
        intensity={1.25}
        speed={0.45}
        interactive
        className="w-[min(80vw,22rem)]"
      />
    </div>
  );
}`,
    files: [
      {
        path: "components/ui-components/ai-orb.tsx",
        description: "AI Orb component",
      },
    ],
  },
  {
    id: "dither-credit-card",
    title: "Dither Credit Card",
    slug: "dither-credit-card",
    eyebrow: "Components",
    description:
      "A responsive payment card with an animated two-color dither field, compact brand lockup, and carefully scaled card details.",
    details: [
      {
        title: "Shader background",
        body: "Paper Design's WebGL dithering shader replaces the static card gradient with a crisp animated wave pattern.",
      },
      {
        title: "Responsive proportions",
        body: "Container-relative sizing preserves the original 605 by 365 composition as the card scales down.",
      },
      {
        title: "Self-contained artwork",
        body: "The brand and payment marks are inline SVG, so the card does not depend on expiring image assets.",
      },
    ],
    dependencies: ["react", "@paper-design/shaders-react", "motion"],
    installDependencies: ["@paper-design/shaders-react", "motion"],
    cliCommand: "https://skecher-ui.vercel.app/r/dither-credit-card.json",
    importName: "DitherCreditCard",
    usage: `import { DitherCreditCard } from "@/components/ui/dither-credit-card";

export default function DitherCreditCardExample() {
  return (
    <div className="flex min-h-96 items-center justify-center p-6">
      <DitherCreditCard className="w-full max-w-[605px]" />
    </div>
  );
}`,
    files: [
      {
        path: "components/ui-components/dither-credit-card.tsx",
        description: "Dither Credit Card component",
      },
    ],
  },
  {
    id: "snap-text",
    title: "Snap Text",
    slug: "snap-text",
    eyebrow: "Components",
    description:
      "A spring-driven scroll-snap narrative with a transitioning portrait prefix, curved outlined rows, and a compact sequence counter.",
    details: [
      {
        title: "Native snap driver",
        body: "An invisible full-height scroller uses mandatory snap sections, so the browser handles wheel, trackpad, and touch landing without JavaScript rounding.",
      },
      {
        title: "Directional image continuity",
        body: "Each portrait crossfades and travels with the same continuous spring value as the text, so forward and reverse scrolling preserve spatial direction without restarting the transition.",
      },
      {
        title: "Curved presentation layer",
        body: "Outlined inactive rows form a curved stack around the active label, while reduced motion keeps the image change to an opacity-only crossfade.",
      },
    ],
    dependencies: ["react", "motion"],
    installDependencies: ["motion"],
    cliCommand: "https://skecher-ui.vercel.app/r/snap-text.json",
    importName: "SnapText",
    usage: `"use client";

import { useState } from "react";

import { SnapText } from "@/components/ui/snap-text";

const steps = [
  "Research the problem.",
  "Shape the direction.",
  "Build the system.",
  "Test every detail.",
];

const images = [
  "/images/process/research.jpg",
  "/images/process/direction.jpg",
  "/images/process/build.jpg",
  "/images/process/test.jpg",
];

const colors = ["#8CD7C0", "#FFD873", "#FF5768", "#6C89C5"];

export default function SnapTextExample() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <SnapText
      items={steps}
      images={images}
      colors={colors}
      initialIndex={0}
      onIndexChange={setActiveIndex}
      prefix={
        <span className="font-mono text-sm text-neutral-500">
          {String(activeIndex + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
        </span>
      }
      itemHeight={96}
      indent={28}
      inactiveColor="#737373"
      spring={{ stiffness: 280, damping: 30, mass: 0.8 }}
      className="h-[42rem]"
    />
  );
}`,
    files: [
      {
        path: "components/ui-components/snap-text.tsx",
        description: "Snap Text component",
      },
    ],
  },
];

export function getComponentDoc(slug: string) {
  return COMPONENT_DOCS.find((page) => page.slug === slug);
}
