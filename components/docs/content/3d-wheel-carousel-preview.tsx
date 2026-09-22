"use client";

import { type DialConfig, useDialKit } from "dialkit";
import Image from "next/image";

import { WheelCarousel } from "@/components/ui-components/3d-wheel-carousel";

const WHEEL_CAROUSEL_DIALS = {
  layout: {
    radius: [560, 320, 800, 10],
    cardWidth: [280, 180, 420, 10],
    cardHeight: [380, 240, 560, 10],
    mobileScale: [0.68, 0.4, 1, 0.01],
  },
  motion: {
    autoRotateSpeed: [10, 0, 40, 1],
    dragSensitivity: [0.35, 0.1, 1, 0.05],
    direction: {
      type: "select",
      options: ["left", "right"],
      default: "left",
    },
    paused: false,
    pauseOnHover: true,
  },
  effects: {
    maxBlur: [12, 0, 24, 1],
    cornerRadius: [16, 0, 40, 1],
  },
} satisfies DialConfig;

const ITEMS = Array.from({ length: 8 }, (_, index) => ({
  id: `artwork-${index + 1}`,
  label: `Abstract artwork ${index + 1}`,
  content: (
    <Image
      alt={`Abstract artwork ${index + 1}`}
      className="h-full w-full object-cover"
      draggable={false}
      height={760}
      unoptimized
      src={`/images/WheelScrollCarousel/image${index + 1}.png`}
      width={560}
    />
  ),
}));

export function WheelCarouselPreview() {
  const dials = useDialKit("3D Wheel Carousel", WHEEL_CAROUSEL_DIALS, {
    id: "preview-3d-wheel-carousel",
  });

  return (
    <WheelCarousel
      autoRotateSpeed={dials.motion.autoRotateSpeed}
      cardClassName=""
      cardHeight={dials.layout.cardHeight}
      cardWidth={dials.layout.cardWidth}
      className="h-full w-full justify-center items-center"
      direction={dials.motion.direction as "left" | "right"}
      dragSensitivity={dials.motion.dragSensitivity}
      items={ITEMS}
      maxBlur={dials.effects.maxBlur}
      mobileScale={dials.layout.mobileScale}
      pauseOnHover={dials.motion.pauseOnHover}
      paused={dials.motion.paused}
      radius={dials.layout.radius}
      style={{ "--wheel-card-radius": `${dials.effects.cornerRadius}px` } as React.CSSProperties}
    />
  );
}
