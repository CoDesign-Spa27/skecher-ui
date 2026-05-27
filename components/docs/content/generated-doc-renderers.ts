import { GooeyToolbarDoc } from "@/components/docs/content/gooey-toolbar-doc";
import { LiquidGlassSocialDoc } from "@/components/docs/content/liquid-glass-social-doc";
import { StreamingTextDoc } from "@/components/docs/content/streaming-text-doc";
import { TextMorphingDoc } from "@/components/docs/content/text-morphing-doc";
import type { getComponentDoc } from "@/lib/docs-content";

type ComponentDocPage = (props: {
  page: NonNullable<ReturnType<typeof getComponentDoc>>;
}) => Promise<React.ReactNode>;

export const DOC_RENDERERS = {
  "gooey-toolbar": GooeyToolbarDoc,
  "liquid-glass-social": LiquidGlassSocialDoc,
  "streaming-text": StreamingTextDoc,
  "text-morphing": TextMorphingDoc
} satisfies Record<string, ComponentDocPage>;
