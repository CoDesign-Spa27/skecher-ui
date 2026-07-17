import {
  IconDocFolder,
  IconFileDownload,
  IconHouse,
  IconSquareGrid,
  IconSquareKanban,
  IconWindow2,
} from "nucleo-glass";

import {
  ControlledAiChatBoxPreview,
  ControlledAiOrbPreview,
  ControlledSnapTextPreview,
} from "@/components/docs/content/component-preview-controls";
import { LiquidMorphologySlideshowPreview } from "@/components/docs/content/liquid-morphology-slideshow-preview";
import { DitherCreditCard } from "@/components/ui-components/dither-credit-card";
import { Dock } from "@/components/ui-components/dock";
import GooeyToolbar from "@/components/ui-components/gooey-toolbar";
import { ImageDensityGrid } from "@/components/ui-components/image-density-grid";
import { ImageGlide } from "@/components/ui-components/image-glide";
import { Social } from "@/components/ui-components/liquid-glass-social";
import { MagazineScroller } from "@/components/ui-components/magazine-scroller";
import { MorphingActionDock } from "@/components/ui-components/morphing-action-dock";
import { BlurredText } from "@/components/ui-components/streaming-text";
import { MorphingText } from "@/components/ui-components/text-morphing";

const iconClassName = "size-full";

export const COMPONENT_PREVIEWS = {
  "ai-chat-box": <ControlledAiChatBoxPreview />,
  "ai-orb": <ControlledAiOrbPreview />,
  "dither-credit-card": <DitherCreditCard />,
  dock: (
    <Dock
      items={[
        {
          id: "home",
          label: "Home",
          icon: <IconWindow2 className={iconClassName} />,
        },
        {
          id: "search",
          label: "Search",
          icon: <IconFileDownload className={iconClassName} />,
        },
        {
          id: "sparkles",
          label: "Create",
          icon: <IconSquareKanban className={iconClassName} />,
        },
        {
          id: "updates",
          label: "Updates",
          icon: <IconDocFolder className={iconClassName} />,
        },
        {
          id: "profile",
          label: "Profile",
          icon: <IconHouse className={iconClassName} />,
        },
        {
          id: "settings",
          label: "Settings",
          icon: <IconSquareGrid className={iconClassName} />,
        },
      ]}
    />
  ),
  "gooey-toolbar": <GooeyToolbar />,
  "image-density-grid": <ImageDensityGrid />,
  "image-glide": <ImageGlide />,
  "liquid-glass-social": <Social />,
  "liquid-morphology-slideshow": <LiquidMorphologySlideshowPreview />,
  "magazine-scroller": <MagazineScroller />,
  "morphing-action-dock": <MorphingActionDock />,
  "snap-text": <ControlledSnapTextPreview />,
  "streaming-text": (
    <BlurredText
      text="Stop acting as if life is a rehearsal."
      className="max-w-4xl text-center font-raleway text-2xl font-medium sm:text-3xl lg:text-4xl"
    />
  ),
  "text-morphing": (
    <MorphingText
      texts={[
        "AI begins analyzing your data...",
        "Processing information and finding patterns...",
        "Generating intelligent responses...",
        "Learning and adapting to improve results...",
        "AI process complete: ready for your next command...",
      ]}
      className="max-w-4xl whitespace-normal text-center font-raleway text-sm font-medium leading-tight sm:text-2xl md:text-3xl lg:text-4xl"
    />
  ),
} satisfies Record<string, React.ReactNode>;

export function getComponentPreview(slug: string) {
  return COMPONENT_PREVIEWS[slug as keyof typeof COMPONENT_PREVIEWS];
}
