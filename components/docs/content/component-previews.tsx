import {
  DialedAiChatBoxPreview,
  DialedAiOrbPreview,
  DialedDitherCreditCardPreview,
  DialedDockPreview,
  DialedInteractiveGridHeroPreview,
  DialedMagazineScrollerPreview,
  DialedMorphStackPreview,
  DialedScrollRevealTextPreview,
  DialedSnapTextPreview,
} from "@/components/docs/content/component-preview-dials";
import { LiquidMorphologySlideshowPreview } from "@/components/docs/content/liquid-morphology-slideshow-preview";
import { SlidingPanelPreview } from "@/components/docs/content/sliding-panel-preview";
import GooeyToolbar from "@/components/ui-components/gooey-toolbar";
import { ImageDensityGrid } from "@/components/ui-components/image-density-grid";
import { ImageGlide } from "@/components/ui-components/image-glide";
import { Social } from "@/components/ui-components/liquid-glass-social";
import { MorphingActionDock } from "@/components/ui-components/morphing-action-dock";
import { BlurredText } from "@/components/ui-components/streaming-text";
import { MorphingText } from "@/components/ui-components/text-morphing";

export const COMPONENT_PREVIEWS = {
  "ai-chat-box": <DialedAiChatBoxPreview />,
  "ai-orb": <DialedAiOrbPreview />,
  "dither-credit-card": <DialedDitherCreditCardPreview />,
  dock: <DialedDockPreview />,
  "gooey-toolbar": <GooeyToolbar />,
  "image-density-grid": <ImageDensityGrid />,
  "image-glide": <ImageGlide />,
  "interactive-grid-hero": <DialedInteractiveGridHeroPreview />,
  "liquid-glass-social": <Social />,
  "liquid-morphology-slideshow": <LiquidMorphologySlideshowPreview />,
  "magazine-scroller": <DialedMagazineScrollerPreview />,
  "morph-stack": <DialedMorphStackPreview />,
  "morphing-action-dock": <MorphingActionDock />,
  "scroll-reveal-text": <DialedScrollRevealTextPreview />,
  "sliding-panel": <SlidingPanelPreview />,
  "snap-text": <DialedSnapTextPreview />,
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
