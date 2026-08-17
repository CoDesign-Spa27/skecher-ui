"use client";

import { type ComponentProps, useId } from "react";

import { MorphStack, type MorphStackMotion } from "@/components/ui-components/morph-stack";
import { cn } from "@/lib/utils";

type MorphStackPreviewProps = {
  expanded?: boolean;
  interactive?: boolean;
  motion?: MorphStackMotion;
};

type MorphStackMarkProps = MorphStackPreviewProps & {
  className?: string;
  plateClassName?: string;
};

type PlateProps = ComponentProps<"svg">;

export function FrontPlate({ className, ...props }: PlateProps) {
  const filterId = useId();

  return (
    <svg
      {...props}
      className={cn("shrink-0", className)}
      width="200"
      height="200"
      viewBox="0 0 83 74"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter={`url(#${filterId})`}>
        <path
          d="M17.3328 7.20072C18.7625 6.65021 20.3772 7.26531 21.0783 8.62745L43.675 52.5317C44.3761 53.8938 45.9908 54.5089 47.4205 53.9585L67.5338 46.2136C69.8834 45.3089 70.1406 42.0869 67.9643 40.8209L54.7842 33.1537C53.9979 32.6963 53.0465 32.6203 52.1977 32.9472L17.078 46.4704C15.1096 47.2284 12.9942 45.7719 13 43.6626L13.0656 19.5483L13.0309 10.9288C13.0259 9.68356 13.7907 8.56465 14.9529 8.11716L17.3328 7.20072Z"
          fill="white"
        />
      </g>
      <defs>
        <filter
          id={filterId}
          x="0"
          y="0"
          width="82.4561"
          height="73.1592"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="4"
            operator="erode"
            in="SourceAlpha"
            result="effect1_dropShadow_1089_111"
          />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="0.75" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0313726 0 0 0 0 0.0313726 0 0 0 0 0.0313726 0 0 0 0.25 0"
          />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1089_111" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="4"
            operator="erode"
            in="SourceAlpha"
            result="effect2_dropShadow_1089_111"
          />
          <feOffset dy="6" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0313726 0 0 0 0 0.0313726 0 0 0 0 0.0313726 0 0 0 0.05 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_1089_111"
            result="effect2_dropShadow_1089_111"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6" />
          <feGaussianBlur stdDeviation="6.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0313726 0 0 0 0 0.0313726 0 0 0 0 0.0313726 0 0 0 0.03 0"
          />
          <feBlend
            mode="normal"
            in2="effect2_dropShadow_1089_111"
            result="effect3_dropShadow_1089_111"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect3_dropShadow_1089_111"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}

export function MiddlePlate({ className, ...props }: PlateProps) {
  const filterId = useId();
  const gradientId = useId();

  return (
    <svg
      {...props}
      className={cn("shrink-0", className)}
      width="200"
      height="200"
      viewBox="0 0 87 85"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter={`url(#${filterId})`}>
        <rect x="2" width="82.162" height="80.8452" rx="24" fill={`url(#${gradientId})`} />
        <rect x="2.5" y="0.5" width="81.162" height="79.8452" rx="23.5" stroke="#FF4C00" />
      </g>
      <defs>
        <filter
          id={filterId}
          x="-10"
          y="-2"
          width="96.1621"
          height="86.8447"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1089_110" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_1089_110"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="shape" result="effect2_innerShadow_1089_110" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="3" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0" />
          <feBlend
            mode="normal"
            in2="effect2_innerShadow_1089_110"
            result="effect3_innerShadow_1089_110"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-2" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" />
          <feBlend
            mode="normal"
            in2="effect3_innerShadow_1089_110"
            result="effect4_innerShadow_1089_110"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-2" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend
            mode="normal"
            in2="effect4_innerShadow_1089_110"
            result="effect5_innerShadow_1089_110"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-12" />
          <feGaussianBlur stdDeviation="7.5" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" />
          <feBlend
            mode="normal"
            in2="effect5_innerShadow_1089_110"
            result="effect6_innerShadow_1089_110"
          />
        </filter>
        <linearGradient
          id={gradientId}
          x1="43.081"
          y1="13.2945"
          x2="43.081"
          y2="80.8452"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF4C00" />
          <stop offset="1" stopColor="#FFB18F" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function BackPlate({ className, ...props }: PlateProps) {
  const filterId = useId();
  const gradientId = useId();

  return (
    <svg
      {...props}
      className={cn("shrink-0", className)}
      width="200"
      height="200"
      viewBox="0 0 87 85"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter={`url(#${filterId})`}>
        <rect x="2" width="82.162" height="80.8452" rx="24" fill={`url(#${gradientId})`} />
        <rect x="2.5" y="0.5" width="81.162" height="79.8452" rx="23.5" stroke="#131313" />
      </g>
      <defs>
        <filter
          id={filterId}
          x="-10"
          y="-2"
          width="96.1621"
          height="86.8447"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1089_109" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_1089_109"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="shape" result="effect2_innerShadow_1089_109" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="3" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0" />
          <feBlend
            mode="normal"
            in2="effect2_innerShadow_1089_109"
            result="effect3_innerShadow_1089_109"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-2" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" />
          <feBlend
            mode="normal"
            in2="effect3_innerShadow_1089_109"
            result="effect4_innerShadow_1089_109"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-2" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend
            mode="normal"
            in2="effect4_innerShadow_1089_109"
            result="effect5_innerShadow_1089_109"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-12" />
          <feGaussianBlur stdDeviation="7.5" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" />
          <feBlend
            mode="normal"
            in2="effect5_innerShadow_1089_109"
            result="effect6_innerShadow_1089_109"
          />
        </filter>
        <linearGradient
          id={gradientId}
          x1="43.081"
          y1="13.2945"
          x2="43.081"
          y2="80.8452"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#191919" />
          <stop offset="1" stopColor="#1C1C1C" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function MorphStackMark({
  className,
  expanded,
  interactive,
  motion,
  plateClassName,
}: MorphStackMarkProps = {}) {
  return (
    <MorphStack
      backPlate={<BackPlate className={plateClassName} />}
      className={className}
      expanded={expanded}
      frontPlate={<FrontPlate className={plateClassName} />}
      interactive={interactive}
      middlePlate={<MiddlePlate className={plateClassName} />}
      motion={motion}
    />
  );
}

export function MorphStackPreview({ expanded, interactive, motion }: MorphStackPreviewProps = {}) {
  return (
    <div className="flex min-h-[24rem] w-full items-center justify-center">
      <MorphStackMark expanded={expanded} interactive={interactive} motion={motion} />
    </div>
  );
}

export default MorphStackPreview;
