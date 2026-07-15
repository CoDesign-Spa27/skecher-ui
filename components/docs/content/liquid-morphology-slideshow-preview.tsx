"use client";

import dynamic from "next/dynamic";

const LiquidMorphologySlideshow = dynamic(
  () =>
    import("@/components/ui-components/liquid-morphology-slideshow").then(
      (mod) => mod.LiquidMorphologySlideshow,
    ),
  {
    ssr: false,
    loading: () => <div className="h-svh w-full bg-black" />,
  },
);

export function LiquidMorphologySlideshowPreview() {
  return (
    <LiquidMorphologySlideshow className="h-full rounded-none" initialIndex={1} showHelp={false} />
  );
}
