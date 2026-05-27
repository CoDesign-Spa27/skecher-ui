import GooeyToolbar from "@/components/ui-components/gooey-toolbar";
import { ImageGlide } from "@/components/ui-components/image-glide";
import { Social } from "@/components/ui-components/liquid-glass-social";
import { BlurredText } from "@/components/ui-components/streaming-text";
import { MorphingText } from "@/components/ui-components/text-morphing";

export const COMPONENT_PREVIEWS = {
  "gooey-toolbar": <GooeyToolbar />,
  "image-glide": <ImageGlide />,
  "liquid-glass-social": <Social />,
  "streaming-text": (
    <BlurredText
      text="Stop acting as if life is a rehearsal."
      className="mx-auto p-2 text-center font-raleway text-4xl font-medium"
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
      className="mx-auto p-2 text-center font-raleway font-medium"
    />
  ),
} satisfies Record<string, React.ReactNode>;

export function getComponentPreview(slug: string) {
  return COMPONENT_PREVIEWS[slug as keyof typeof COMPONENT_PREVIEWS];
}
