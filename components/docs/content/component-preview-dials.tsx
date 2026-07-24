"use client";

import { type DialConfig, useDialKit } from "dialkit";
import {
  IconDocFolder,
  IconFileDownload,
  IconHouse,
  IconSquareGrid,
  IconSquareKanban,
  IconWindow2,
} from "nucleo-glass";
import { useEffect, useRef } from "react";

import { AiChatBox } from "@/components/ui-components/ai-chat-box";
import { AiOrb } from "@/components/ui-components/ai-orb";
import {
  DitherCreditCard,
  type DitherCreditCardDither,
  type DitherCreditCardPhysics,
} from "@/components/ui-components/dither-credit-card";
import { Dock, type DockItem } from "@/components/ui-components/dock";
import { MagazineScroller } from "@/components/ui-components/magazine-scroller";
import { SnapText } from "@/components/ui-components/snap-text";

const AI_ORB_DIALS = {
  intensity: [1.25, 0.5, 2.2, 0.05],
  speed: [0.45, 0, 1.2, 0.05],
  interactive: true,
} satisfies DialConfig;

const AI_CHAT_BOX_DIALS = {
  copy: {
    emptyLabel: { type: "text", default: "Let's Begin" },
    placeholder: { type: "text", default: "Ask anything" },
  },
  disabled: false,
} satisfies DialConfig;

const DITHER_CREDIT_CARD_DIALS = {
  colors: {
    background: { type: "color", default: "#faa200" },
    foreground: { type: "color", default: "#ffffff" },
    details: { type: "color", default: "#5f5f5f" },
    accent: { type: "color", default: "#ffc831" },
  },
  pattern: {
    shape: {
      type: "select",
      options: ["simplex", "warp", "dots", "wave", "ripple", "swirl", "sphere"],
      default: "wave",
    },
    type: {
      type: "select",
      options: ["random", "2x2", "4x4", "8x8"],
      default: "8x8",
    },
    size: [2, 0.5, 20, 0.5],
    speed: [0.26, 0, 1.2, 0.02],
    scale: [2.52, 0.25, 4, 0.01],
    rotation: [8, 0, 360, 1],
    position: {
      _collapsed: true,
      offsetX: [0.6, -1, 1, 0.01],
      offsetY: [0.46, -1, 1, 0.01],
    },
  },
  content: {
    _collapsed: true,
    brandName: { type: "text", default: "Skecher-ui" },
    cardNumber: { type: "text", default: "4325 2535" },
    cardholder: { type: "text", default: "@roohbuilds" },
  },
  physics: {
    enabled: true,
    mode: {
      type: "select",
      options: [
        { value: "tilt", label: "Pointer tilt" },
        { value: "magnetic", label: "Magnetic follow" },
        { value: "zero-gravity", label: "Zero gravity" },
      ],
      default: "zero-gravity",
    },
    response: {
      tilt: [12, 0, 24, 0.5],
      magnetism: [18, 0, 40, 1],
      lift: [12, 0, 30, 1],
      scale: [1.025, 1, 1.08, 0.005],
      perspective: [1000, 600, 2000, 50],
      glare: [0.42, 0, 0.8, 0.02],
    },
    spring: {
      type: "spring",
      visualDuration: 0.38,
      bounce: 0.12,
    },
  },
} satisfies DialConfig;

const DOCK_DIALS = {
  magnification: {
    items: [6, 2, 6, 1],
    baseSize: [44, 28, 72, 2],
    maxSize: [80, 44, 120, 2],
    influence: [140, 60, 260, 5],
  },
  interaction: {
    tapScale: [0.88, 0.7, 1, 0.01],
    jelly: [0.08, 0, 0.2, 0.01],
  },
  physics: {
    size: {
      type: "spring",
      stiffness: 170,
      damping: 14,
      mass: 0.1,
    },
    highlight: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      mass: 0.22,
    },
    visibility: {
      type: "spring",
      stiffness: 200,
      damping: 25,
      mass: 1,
    },
  },
} satisfies DialConfig;

const DOCK_ICON_CLASS_NAME = "size-full";

const DOCK_PREVIEW_ITEMS = [
  { id: "home", label: "Home", icon: <IconWindow2 className={DOCK_ICON_CLASS_NAME} /> },
  {
    id: "downloads",
    label: "Downloads",
    icon: <IconFileDownload className={DOCK_ICON_CLASS_NAME} />,
  },
  {
    id: "projects",
    label: "Projects",
    icon: <IconSquareKanban className={DOCK_ICON_CLASS_NAME} />,
  },
  {
    id: "files",
    label: "Files",
    icon: <IconDocFolder className={DOCK_ICON_CLASS_NAME} />,
  },
  { id: "profile", label: "Profile", icon: <IconHouse className={DOCK_ICON_CLASS_NAME} /> },
  {
    id: "settings",
    label: "Settings",
    icon: <IconSquareGrid className={DOCK_ICON_CLASS_NAME} />,
  },
] satisfies readonly DockItem[];

const DOCK_CODE_ITEMS = [
  { id: "home", label: "Home", icon: "Home" },
  { id: "search", label: "Search", icon: "Search" },
  { id: "projects", label: "Projects", icon: "PanelsTopLeft" },
  { id: "files", label: "Files", icon: "Folder" },
  { id: "profile", label: "Profile", icon: "User" },
  { id: "settings", label: "Settings", icon: "Settings" },
] as const;

const SNAP_TEXT_DIALS = {
  content: {
    _collapsed: true,
    prefix: { type: "text", default: "" },
    line1: { type: "text", default: "A signal appears." },
    line2: { type: "text", default: "The grid wakes up." },
    line3: { type: "text", default: "Color breaks free." },
    line4: { type: "text", default: "Gravity lets go." },
    line5: { type: "text", default: "The impossible forms." },
    line6: { type: "text", default: "Everything comes alive." },
  },
  display: {
    initialIndex: [3, 0, 5, 1],
    showCounter: true,
    showImages: true,
  },
  effects: {
    _collapsed: true,
    indent: [32, 0, 96, 2],
    imageOffsetPercent: [24, 0, 80, 1],
    imageScaleFalloff: [0.04, 0, 0.25, 0.01],
    maxIndentSteps: [3, 0, 6, 0.25],
    rowMinOpacity: [0.24, 0, 1, 0.01],
    rowOpacityFalloff: [0.68, 0, 1, 0.01],
    rowMinScale: [0.8, 0.4, 1, 0.01],
    rowScaleFalloff: [0.1, 0, 0.3, 0.01],
    rowStretch: [0.1, 0, 0.4, 0.01],
  },
  physics: {
    spring: {
      type: "spring",
      stiffness: 280,
      damping: 30,
      mass: 0.8,
    },
  },
} satisfies DialConfig;

const MAGAZINE_SCROLLER_DIALS = {
  movement: {
    wheelSpeed: [1.15, 0.1, 3, 0.05],
    dragSpeed: [1.15, 0.1, 3, 0.05],
    autoSpeed: [0, -300, 300, 5],
    lockWheel: true,
  },
  bending: {
    slices: [9, 1, 20, 1],
    strength: [82, 20, 200, 2],
    maximum: [100, 0, 180, 5],
  },
  physics: {
    position: {
      type: "spring",
      stiffness: 95,
      damping: 24,
      mass: 0.28,
    },
    velocity: {
      type: "spring",
      stiffness: 80,
      damping: 34,
      mass: 0.18,
    },
  },
} satisfies DialConfig;

type SpringCodeConfig = {
  bounce?: number;
  damping?: number;
  mass?: number;
  stiffness?: number;
  visualDuration?: number;
};

function formatSpringCode(config: SpringCodeConfig) {
  const properties = [
    ["visualDuration", config.visualDuration],
    ["bounce", config.bounce],
    ["stiffness", config.stiffness],
    ["damping", config.damping],
    ["mass", config.mass],
  ].filter((property): property is [string, number] => typeof property[1] === "number");

  return `{
        ${properties.map(([name, value]) => `${name}: ${value}`).join(",\n        ")},
      }`;
}

function createDitherCreditCardCode(
  dials: ReturnType<typeof useDitherCreditCardDials>,
  spring: SpringCodeConfig,
) {
  return `import { DitherCreditCard } from "@/components/ui/dither-credit-card";

export function DitherCreditCardDemo() {
  return (
    <DitherCreditCard
      colors={{
        accent: ${JSON.stringify(dials.colors.accent)},
        background: ${JSON.stringify(dials.colors.background)},
        details: ${JSON.stringify(dials.colors.details)},
        foreground: ${JSON.stringify(dials.colors.foreground)},
      }}
      content={{
        brandName: ${JSON.stringify(dials.content.brandName)},
        cardNumber: ${JSON.stringify(dials.content.cardNumber)},
        cardholder: ${JSON.stringify(dials.content.cardholder)},
      }}
      dither={{
        offsetX: ${dials.pattern.position.offsetX},
        offsetY: ${dials.pattern.position.offsetY},
        rotation: ${dials.pattern.rotation},
        scale: ${dials.pattern.scale},
        shape: ${JSON.stringify(dials.pattern.shape)},
        size: ${dials.pattern.size},
        speed: ${dials.pattern.speed},
        type: ${JSON.stringify(dials.pattern.type)},
      }}
      interactive={${dials.physics.enabled}}
      physics={{
        mode: ${JSON.stringify(dials.physics.mode)},
        tilt: ${dials.physics.response.tilt},
        magnetism: ${dials.physics.response.magnetism},
        lift: ${dials.physics.response.lift},
        scale: ${dials.physics.response.scale},
        perspective: ${dials.physics.response.perspective},
        glare: ${dials.physics.response.glare},
        spring: ${formatSpringCode(spring)},
      }}
    />
  );
}`;
}

function createDockCode(
  dials: ReturnType<typeof useDockDials>,
  sizeSpring: SpringCodeConfig,
  highlightSpring: SpringCodeConfig,
  visibilitySpring: SpringCodeConfig,
) {
  const selectedItems = DOCK_CODE_ITEMS.slice(0, Math.round(dials.magnification.items));
  const iconImports = selectedItems.map((item) => item.icon).join(", ");
  const itemsCode = selectedItems
    .map(
      (item) => `  {
    id: "${item.id}",
    label: "${item.label}",
    icon: <${item.icon} className="size-full" />,
  }`,
    )
    .join(",\n");

  return `"use client";

import { ${iconImports} } from "lucide-react";

import { Dock } from "@/components/ui/dock";

const dockItems = [
${itemsCode},
];

export function DockDemo() {
  return (
    <Dock
      items={dockItems}
      baseSize={${dials.magnification.baseSize}}
      maxSize={${dials.magnification.maxSize}}
      influence={${dials.magnification.influence}}
      motion={{
        tapScale: ${dials.interaction.tapScale},
        jelly: ${dials.interaction.jelly},
        sizeSpring: ${formatSpringCode(sizeSpring)},
        highlightSpring: ${formatSpringCode(highlightSpring)},
        visibilitySpring: ${formatSpringCode(visibilitySpring)},
      }}
    />
  );
}`;
}

function createMagazineScrollerCode(
  dials: ReturnType<typeof useMagazineScrollerDials>,
  positionSpring: SpringCodeConfig,
  velocitySpring: SpringCodeConfig,
) {
  return `import { MagazineScroller } from "@/components/ui/magazine-scroller";

export function MagazineScrollerDemo() {
  return (
    <MagazineScroller
      slices={${dials.bending.slices}}
      wheelSpeed={${dials.movement.wheelSpeed}}
      dragSpeed={${dials.movement.dragSpeed}}
      autoSpeed={${dials.movement.autoSpeed}}
      bendStrength={${dials.bending.strength}}
      maxBend={${dials.bending.maximum}}
      lockWheel={${dials.movement.lockWheel}}
      positionSpring={${formatSpringCode(positionSpring)}}
      velocitySpring={${formatSpringCode(velocitySpring)}}
    />
  );
}`;
}

function getSnapTextItems(dials: ReturnType<typeof useSnapTextDials>) {
  return [
    dials.content.line1,
    dials.content.line2,
    dials.content.line3,
    dials.content.line4,
    dials.content.line5,
    dials.content.line6,
  ];
}

function formatCodeArray(values: string[]) {
  return JSON.stringify(values, null, 2).replaceAll("\n", "\n  ");
}

function createSnapTextCode(dials: ReturnType<typeof useSnapTextDials>, spring: SpringCodeConfig) {
  const items = getSnapTextItems(dials);

  return `import { SnapText } from "@/components/ui/snap-text";

const items = ${formatCodeArray(items)};

export function SnapTextDemo() {
  return (
    <SnapText
      items={items}
${dials.display.showImages ? "" : "      images={[]}\n"}      prefix={${JSON.stringify(dials.content.prefix)}}
      indent={${dials.effects.indent}}
      initialIndex={${dials.display.initialIndex}}
      showCounter={${dials.display.showCounter}}
      effects={{
        imageOffsetPercent: ${dials.effects.imageOffsetPercent},
        imageScaleFalloff: ${dials.effects.imageScaleFalloff},
        maxIndentSteps: ${dials.effects.maxIndentSteps},
        rowMinOpacity: ${dials.effects.rowMinOpacity},
        rowOpacityFalloff: ${dials.effects.rowOpacityFalloff},
        rowMinScale: ${dials.effects.rowMinScale},
        rowScaleFalloff: ${dials.effects.rowScaleFalloff},
        rowStretch: ${dials.effects.rowStretch},
      }}
      spring={${formatSpringCode(spring)}}
    />
  );
}`;
}

function useSnapTextDials() {
  return useDialKit("Snap Text", SNAP_TEXT_DIALS, { id: "preview-snap-text" });
}

function useDitherCreditCardDials() {
  return useDialKit("Dither Credit Card", DITHER_CREDIT_CARD_DIALS, {
    id: "preview-dither-credit-card",
  });
}

function useDockDials() {
  return useDialKit("Dock", DOCK_DIALS, { id: "preview-dock" });
}

function useMagazineScrollerDials() {
  return useDialKit("Magazine Scroller", MAGAZINE_SCROLLER_DIALS, {
    id: "preview-magazine-scroller",
  });
}

/**
 * DialKit 1.4.2 does not expose a toolbar copy formatter. While this preview is
 * mounted, replace only its identifiable clipboard payload with component code.
 */
function useDialKitCopyOutput(panelName: string, output: string) {
  const outputRef = useRef(output);
  outputRef.current = output;

  useEffect(() => {
    const clipboard = navigator.clipboard;
    if (!clipboard?.writeText) return;

    const copyPrefix = `Update the useDialKit configuration for "${panelName}"`;
    const ownDescriptor = Object.getOwnPropertyDescriptor(clipboard, "writeText");
    const writeText = clipboard.writeText.bind(clipboard);

    try {
      Object.defineProperty(clipboard, "writeText", {
        configurable: true,
        value: (text: string) => writeText(text.startsWith(copyPrefix) ? outputRef.current : text),
      });
    } catch {
      const handleCopyClick = (event: MouseEvent) => {
        if (!(event.target instanceof Element)) return;

        const button = event.target.closest<HTMLButtonElement>('button[title="Copy parameters"]');
        const folder = button?.closest(".dialkit-folder");
        const title = folder?.querySelector<HTMLElement>(
          ":scope > .dialkit-folder-header .dialkit-folder-title",
        );

        if (title?.textContent?.trim() !== panelName) return;

        window.queueMicrotask(() => {
          void writeText(outputRef.current);
        });
      };

      document.addEventListener("click", handleCopyClick);
      return () => document.removeEventListener("click", handleCopyClick);
    }

    return () => {
      if (ownDescriptor) {
        Object.defineProperty(clipboard, "writeText", ownDescriptor);
      } else {
        Reflect.deleteProperty(clipboard, "writeText");
      }
    };
  }, [panelName]);
}

export function DialedAiOrbPreview() {
  const dials = useDialKit("AI Orb", AI_ORB_DIALS, { id: "preview-ai-orb" });

  return <AiOrb intensity={dials.intensity} interactive={dials.interactive} speed={dials.speed} />;
}

export function DialedAiChatBoxPreview() {
  const dials = useDialKit("AI Chat Box", AI_CHAT_BOX_DIALS, {
    id: "preview-ai-chat-box",
  });

  return (
    <AiChatBox
      disabled={dials.disabled}
      labels={{ empty: dials.copy.emptyLabel, input: dials.copy.placeholder }}
    />
  );
}

export function DialedDitherCreditCardPreview() {
  const dials = useDitherCreditCardDials();
  const spring = dials.physics.spring.type === "spring" ? dials.physics.spring : undefined;
  const dither = {
    offsetX: dials.pattern.position.offsetX,
    offsetY: dials.pattern.position.offsetY,
    rotation: dials.pattern.rotation,
    scale: dials.pattern.scale,
    shape: dials.pattern.shape as DitherCreditCardDither["shape"],
    size: dials.pattern.size,
    speed: dials.pattern.speed,
    type: dials.pattern.type as DitherCreditCardDither["type"],
  } satisfies DitherCreditCardDither;
  const physics = {
    glare: dials.physics.response.glare,
    lift: dials.physics.response.lift,
    magnetism: dials.physics.response.magnetism,
    mode: dials.physics.mode as DitherCreditCardPhysics["mode"],
    perspective: dials.physics.response.perspective,
    scale: dials.physics.response.scale,
    spring,
    tilt: dials.physics.response.tilt,
  } satisfies DitherCreditCardPhysics;
  const componentCode = createDitherCreditCardCode(dials, spring ?? {});

  useDialKitCopyOutput("Dither Credit Card", componentCode);

  return (
    <DitherCreditCard
      colors={{
        accent: dials.colors.accent,
        background: dials.colors.background,
        details: dials.colors.details,
        foreground: dials.colors.foreground,
      }}
      content={{
        brandName: dials.content.brandName,
        cardNumber: dials.content.cardNumber,
        cardholder: dials.content.cardholder,
      }}
      dither={dither}
      interactive={dials.physics.enabled}
      physics={physics}
    />
  );
}

export function DialedDockPreview() {
  const dials = useDockDials();
  const sizeSpring = dials.physics.size.type === "spring" ? dials.physics.size : undefined;
  const highlightSpring =
    dials.physics.highlight.type === "spring" ? dials.physics.highlight : undefined;
  const visibilitySpring =
    dials.physics.visibility.type === "spring" ? dials.physics.visibility : undefined;
  const componentCode = createDockCode(
    dials,
    sizeSpring ?? {},
    highlightSpring ?? {},
    visibilitySpring ?? {},
  );

  useDialKitCopyOutput("Dock", componentCode);

  return (
    <Dock
      baseSize={dials.magnification.baseSize}
      influence={dials.magnification.influence}
      items={DOCK_PREVIEW_ITEMS.slice(0, Math.round(dials.magnification.items))}
      maxSize={dials.magnification.maxSize}
      motion={{
        highlightSpring,
        jelly: dials.interaction.jelly,
        sizeSpring,
        tapScale: dials.interaction.tapScale,
        visibilitySpring,
      }}
    />
  );
}

export function DialedSnapTextPreview() {
  const dials = useSnapTextDials();
  const items = getSnapTextItems(dials);
  const spring = dials.physics.spring.type === "spring" ? dials.physics.spring : undefined;
  const componentCode = createSnapTextCode(dials, spring ?? {});

  useDialKitCopyOutput("Snap Text", componentCode);

  return (
    <SnapText
      className="h-full"
      effects={{
        imageOffsetPercent: dials.effects.imageOffsetPercent,
        imageScaleFalloff: dials.effects.imageScaleFalloff,
        maxIndentSteps: dials.effects.maxIndentSteps,
        rowMinOpacity: dials.effects.rowMinOpacity,
        rowOpacityFalloff: dials.effects.rowOpacityFalloff,
        rowMinScale: dials.effects.rowMinScale,
        rowScaleFalloff: dials.effects.rowScaleFalloff,
        rowStretch: dials.effects.rowStretch,
      }}
      images={dials.display.showImages ? undefined : []}
      indent={dials.effects.indent}
      initialIndex={dials.display.initialIndex}
      items={items}
      prefix={dials.content.prefix}
      showCounter={dials.display.showCounter}
      spring={spring}
    />
  );
}

export function DialedMagazineScrollerPreview() {
  const dials = useMagazineScrollerDials();
  const positionSpring =
    dials.physics.position.type === "spring" ? dials.physics.position : undefined;
  const velocitySpring =
    dials.physics.velocity.type === "spring" ? dials.physics.velocity : undefined;
  const componentCode = createMagazineScrollerCode(
    dials,
    positionSpring ?? {},
    velocitySpring ?? {},
  );

  useDialKitCopyOutput("Magazine Scroller", componentCode);

  return (
    <MagazineScroller
      autoSpeed={dials.movement.autoSpeed}
      bendStrength={dials.bending.strength}
      dragSpeed={dials.movement.dragSpeed}
      lockWheel={dials.movement.lockWheel}
      maxBend={dials.bending.maximum}
      positionSpring={positionSpring}
      slices={dials.bending.slices}
      velocitySpring={velocitySpring}
      wheelSpeed={dials.movement.wheelSpeed}
    />
  );
}
