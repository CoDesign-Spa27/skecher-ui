import { GooeyToolbarDoc } from "@/components/docs/content/gooey-toolbar-doc";
import { ImageDensityGridDoc } from "@/components/docs/content/image-density-grid-doc";
import { ImageGlideDoc } from "@/components/docs/content/image-glide-doc";
import { LiquidGlassSocialDoc } from "@/components/docs/content/liquid-glass-social-doc";
import { MorphingActionDockDoc } from "@/components/docs/content/morphing-action-dock-doc";
import { StreamingTextDoc } from "@/components/docs/content/streaming-text-doc";
import { TextMorphingDoc } from "@/components/docs/content/text-morphing-doc";
import type { getComponentDoc } from "@/lib/docs-content";

type ComponentDocPage = (props: {
  page: NonNullable<ReturnType<typeof getComponentDoc>>;
}) => Promise<React.ReactNode>;

export const DOC_RENDERERS = {
  "gooey-toolbar": GooeyToolbarDoc,
  "image-density-grid": ImageDensityGridDoc,
  "image-glide": ImageGlideDoc,
  "liquid-glass-social": LiquidGlassSocialDoc,
  "morphing-action-dock": MorphingActionDockDoc,
  "streaming-text": StreamingTextDoc,
  "text-morphing": TextMorphingDoc
} satisfies Record<string, ComponentDocPage>;
