"use client";

import { type DialConfig, useDialKit } from "dialkit";
import { useEffect, useRef } from "react";

import { AiChatBox } from "@/components/ui-components/ai-chat-box";
import { AiOrb } from "@/components/ui-components/ai-orb";
import { MagazineScroller } from "@/components/ui-components/magazine-scroller";
import { SnapText } from "@/components/ui-components/snap-text";

const AI_ORB_DIALS = {
  colors: {
    primary: { type: "color", default: "#A855F7" },
    secondary: { type: "color", default: "#06B6D4" },
  },
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

const SNAP_TEXT_DIALS = {
  indent: [32, 16, 80, 4],
  itemHeight: [104, 72, 132, 4],
} satisfies DialConfig;

const MAGAZINE_SCROLLER_DIALS = {
  cards: {
    _collapsed: true,
    width: [170, 100, 280, 2],
    height: [250, 150, 400, 2],
    gap: [34, 0, 100, 2],
    slices: [9, 1, 20, 1],
    viewportHeight: [70, 30, 100, 1],
  },
  movement: {
    wheelSpeed: [1.15, 0.1, 3, 0.05],
    dragSpeed: [1.15, 0.1, 3, 0.05],
    autoSpeed: [0, -300, 300, 5],
    lockWheel: true,
  },
  bending: {
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

function createMagazineScrollerCode(
  dials: ReturnType<typeof useMagazineScrollerDials>,
  positionSpring: SpringCodeConfig,
  velocitySpring: SpringCodeConfig,
) {
  return `import { MagazineScroller } from "@/components/ui/magazine-scroller";

export function MagazineScrollerDemo() {
  return (
    <MagazineScroller
      cardWidth={${dials.cards.width}}
      cardHeight={${dials.cards.height}}
      gap={${dials.cards.gap}}
      slices={${dials.cards.slices}}
      height="${dials.cards.viewportHeight}vh"
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

  return (
    <AiOrb
      intensity={dials.intensity}
      interactive={dials.interactive}
      primaryColor={dials.colors.primary}
      secondaryColor={dials.colors.secondary}
      speed={dials.speed}
    />
  );
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

export function DialedSnapTextPreview() {
  const dials = useDialKit("Snap Text", SNAP_TEXT_DIALS, { id: "preview-snap-text" });

  return <SnapText className="h-full" indent={dials.indent} itemHeight={dials.itemHeight} />;
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
      cardHeight={dials.cards.height}
      cardWidth={dials.cards.width}
      dragSpeed={dials.movement.dragSpeed}
      gap={dials.cards.gap}
      height={`${dials.cards.viewportHeight}vh`}
      lockWheel={dials.movement.lockWheel}
      maxBend={dials.bending.maximum}
      positionSpring={positionSpring}
      slices={dials.cards.slices}
      velocitySpring={velocitySpring}
      wheelSpeed={dials.movement.wheelSpeed}
    />
  );
}
