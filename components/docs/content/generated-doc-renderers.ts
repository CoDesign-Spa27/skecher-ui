import { AiChatBoxDoc } from "@/components/docs/content/ai-chat-box-doc";
import { DockDoc } from "@/components/docs/content/dock-doc";
import { GooeyToolbarDoc } from "@/components/docs/content/gooey-toolbar-doc";
import { ImageDensityGridDoc } from "@/components/docs/content/image-density-grid-doc";
import { ImageGlideDoc } from "@/components/docs/content/image-glide-doc";
import { LiquidGlassSocialDoc } from "@/components/docs/content/liquid-glass-social-doc";
import { LiquidMorphologySlideshowDoc } from "@/components/docs/content/liquid-morphology-slideshow-doc";
import { MagazineScrollerDoc } from "@/components/docs/content/magazine-scroller-doc";
import { MorphingActionDockDoc } from "@/components/docs/content/morphing-action-dock-doc";
import { StreamingTextDoc } from "@/components/docs/content/streaming-text-doc";
import { TextMorphingDoc } from "@/components/docs/content/text-morphing-doc";
import type { getComponentDoc } from "@/lib/docs-content";

type ComponentDocPage = (props: {
  page: NonNullable<ReturnType<typeof getComponentDoc>>;
}) => Promise<React.ReactNode>;

export const DOC_RENDERERS = {
  "ai-chat-box": AiChatBoxDoc,
  dock: DockDoc,
  "gooey-toolbar": GooeyToolbarDoc,
  "image-density-grid": ImageDensityGridDoc,
  "image-glide": ImageGlideDoc,
  "liquid-glass-social": LiquidGlassSocialDoc,
  "liquid-morphology-slideshow": LiquidMorphologySlideshowDoc,
  "magazine-scroller": MagazineScrollerDoc,
  "morphing-action-dock": MorphingActionDockDoc,
  "streaming-text": StreamingTextDoc,
  "text-morphing": TextMorphingDoc,
} satisfies Record<string, ComponentDocPage>;
