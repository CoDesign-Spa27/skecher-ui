import { ThreeDWheelCarouselDoc } from "@/components/docs/content/3d-wheel-carousel-doc";
import { AddToCartDoc } from "@/components/docs/content/add-to-cart-doc";
import { AiChatBoxDoc } from "@/components/docs/content/ai-chat-box-doc";
import { AiOrbDoc } from "@/components/docs/content/ai-orb-doc";
import { AnimatedBookDoc } from "@/components/docs/content/animated-book-doc";
import { AppleMailTabsDoc } from "@/components/docs/content/apple-mail-tabs-doc";
import { DitherCreditCardDoc } from "@/components/docs/content/dither-credit-card-doc";
import { DockDoc } from "@/components/docs/content/dock-doc";
import { ExpandableMobileNavDoc } from "@/components/docs/content/expandable-mobile-nav-doc";
import { GooeyToolbarDoc } from "@/components/docs/content/gooey-toolbar-doc";
import { ImageDensityGridDoc } from "@/components/docs/content/image-density-grid-doc";
import { ImageGlideDoc } from "@/components/docs/content/image-glide-doc";
import { InteractiveGridHeroDoc } from "@/components/docs/content/interactive-grid-hero-doc";
import { LiquidGlassSocialDoc } from "@/components/docs/content/liquid-glass-social-doc";
import { LiquidMorphologySlideshowDoc } from "@/components/docs/content/liquid-morphology-slideshow-doc";
import { MagazineScrollerDoc } from "@/components/docs/content/magazine-scroller-doc";
import { MorphMenuDoc } from "@/components/docs/content/morph-menu-doc";
import { MorphStackDoc } from "@/components/docs/content/morph-stack-doc";
import { MorphingActionDockDoc } from "@/components/docs/content/morphing-action-dock-doc";
import { ScrollRevealTextDoc } from "@/components/docs/content/scroll-reveal-text-doc";
import { SlidingPanelDoc } from "@/components/docs/content/sliding-panel-doc";
import { SnapTextDoc } from "@/components/docs/content/snap-text-doc";
import { SpringSliderDoc } from "@/components/docs/content/spring-slider-doc";
import { StreamingTextDoc } from "@/components/docs/content/streaming-text-doc";
import { TextMorphingDoc } from "@/components/docs/content/text-morphing-doc";
import { VelocityTabsDoc } from "@/components/docs/content/velocity-tabs-doc";
import type { getComponentDoc } from "@/lib/docs-content";

type ComponentDocPage = (props: {
  page: NonNullable<ReturnType<typeof getComponentDoc>>;
}) => Promise<React.ReactNode>;

export const DOC_RENDERERS = {
  "3d-wheel-carousel": ThreeDWheelCarouselDoc,
  "add-to-cart": AddToCartDoc,
  "animated-book": AnimatedBookDoc,
  "ai-chat-box": AiChatBoxDoc,
  "ai-orb": AiOrbDoc,
  "apple-mail-tabs": AppleMailTabsDoc,
  "dither-credit-card": DitherCreditCardDoc,
  dock: DockDoc,
  "expandable-mobile-nav": ExpandableMobileNavDoc,
  "gooey-toolbar": GooeyToolbarDoc,
  "image-density-grid": ImageDensityGridDoc,
  "image-glide": ImageGlideDoc,
  "interactive-grid-hero": InteractiveGridHeroDoc,
  "liquid-glass-social": LiquidGlassSocialDoc,
  "liquid-morphology-slideshow": LiquidMorphologySlideshowDoc,
  "magazine-scroller": MagazineScrollerDoc,
  "morph-menu": MorphMenuDoc,
  "morph-stack": MorphStackDoc,
  "morphing-action-dock": MorphingActionDockDoc,
  "scroll-reveal-text": ScrollRevealTextDoc,
  "sliding-panel": SlidingPanelDoc,
  "snap-text": SnapTextDoc,
  "spring-slider": SpringSliderDoc,
  "streaming-text": StreamingTextDoc,
  "text-morphing": TextMorphingDoc,
  "velocity-tabs": VelocityTabsDoc,
} satisfies Record<string, ComponentDocPage>;
