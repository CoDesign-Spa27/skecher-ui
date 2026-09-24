"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ComponentPropsWithoutRef, KeyboardEvent } from "react";
import { useId, useState } from "react";

import { cn } from "@/lib/utils";

export type AnimatedBookProps = Omit<ComponentPropsWithoutRef<"button">, "children"> & {
  /** Image URL rendered across the back cover. */
  coverImage?: string;
  /** Accessible description for the decorative cover image. */
  coverImageAlt?: string;
  /** Uncontrolled initial state. */
  defaultOpen?: boolean;
  /** Number of visible page edges behind the cover. */
  pageCount?: number;
  /** Controlled open state. */
  open?: boolean;
  /** Called whenever the open state changes through hover, focus, or keyboard input. */
  onOpenChange?: (open: boolean) => void;
  /** Cover rotation in degrees while open. */
  openAngle?: number;
};

const OPEN_EASE = [0.77, 0, 0.175, 1] as const;
const PAGE_IDS = [
  "page-one",
  "page-two",
  "page-three",
  "page-four",
  "page-five",
  "page-six",
  "page-seven",
  "page-eight",
] as const;

export function AnimatedBook({
  "aria-label": ariaLabel = "Preview book",
  className,
  coverImage,
  coverImageAlt = "",
  defaultOpen = false,
  disabled = false,
  onBlur,
  onClick,
  onFocus,
  onKeyDown,
  onMouseEnter,
  onMouseLeave,
  onOpenChange,
  open,
  openAngle = -70,
  pageCount = 4,
  style,
  type = "button",
  ...props
}: AnimatedBookProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;
  const visiblePages = Math.max(0, Math.min(Math.floor(pageCount), 8));

  const setOpen = (nextOpen: boolean) => {
    if (disabled || nextOpen === isOpen) return;
    if (!isControlled) setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;

    if (event.key === "Escape") setOpen(false);
  };

  return (
    <button
      {...props}
      aria-describedby={coverImageAlt ? titleId : props["aria-describedby"]}
      aria-label={ariaLabel}
      aria-pressed={isOpen}
      className={cn(
        "relative block aspect-[3/4] w-60 border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      disabled={disabled}
      onBlur={(event) => {
        onBlur?.(event);
        if (!event.defaultPrevented) setOpen(false);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        if (!event.defaultPrevented) setOpen(true);
      }}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(true);
      }}
      onKeyDown={handleKeyDown}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        if (!event.defaultPrevented) setOpen(true);
      }}
      onMouseLeave={(event) => {
        onMouseLeave?.(event);
        if (!event.defaultPrevented && event.currentTarget !== document.activeElement)
          setOpen(false);
      }}
      style={{ perspective: 1200, ...style }}
      type={type}
    >
      <span className="sr-only" id={titleId}>
        {coverImageAlt}
      </span>
      <BookBase className="absolute left-0 top-[0.75%] size-full" image={coverImage} />
      <motion.span
        aria-hidden="true"
        animate={{ transform: `rotateY(${reduceMotion ? 0 : isOpen ? openAngle : 0}deg)` }}
        className="absolute inset-0 origin-left"
        style={{ transformStyle: "preserve-3d" }}
        transition={{ duration: reduceMotion ? 0.15 : 0.7, ease: OPEN_EASE, type: "tween" }}
      >
        {PAGE_IDS.slice(0, visiblePages).map((pageId, index) => (
          <span
            className="absolute left-[8.333%] top-[1.5%] size-full"
            key={pageId}
            style={{
              transform: `translateZ(${(index + 1) * -8}px)`,
              zIndex: visiblePages - index,
            }}
          >
            <InnerPage className="size-full" />
          </span>
        ))}
        <BookCover className="absolute inset-0 z-10 size-full" />
      </motion.span>
    </button>
  );
}

const InnerPage = ({ className }: { className?: string }) => {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      width="300"
      height="399"
      viewBox="0 0 300 399"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_di_402_51)">
        <path
          d="M0.5 5.99999C0.5 2.68629 3.18629 0 6.5 0H159.5C176.069 0 189.5 13.4315 189.5 30V229C189.5 245.569 176.069 259 159.5 259H6.5C3.18629 259 0.5 256.314 0.5 253V5.99999Z"
          fill="white"
        />
        <path
          d="M6.5 0.0996094H159.5C176.013 0.0996094 189.4 13.4867 189.4 30V229C189.4 245.513 176.013 258.9 159.5 258.9H6.5C3.24152 258.9 0.599609 256.258 0.599609 253V6C0.599609 2.74152 3.24152 0.0996096 6.5 0.0996094Z"
          stroke="black"
          strokeWidth="0.5"
        />
      </g>
      <defs>
        <filter
          id="filter0_di_402_51"
          x="0"
          y="0"
          width="190"
          height="260"
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
          <feOffset dy="0.5" />
          <feGaussianBlur stdDeviation="0.25" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_402_51" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_402_51"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="0.5" />
          <feGaussianBlur stdDeviation="0.25" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="shape" result="effect2_innerShadow_402_51" />
        </filter>
      </defs>
    </svg>
  );
};
const BookCover = ({ className }: { className: string }) => {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      width="300"
      height="399"
      viewBox="0 0 300 399"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_ddddii_398_58)">
        <g clipPath="url(#clip0_398_58)">
          <path
            d="M15 14C15 10.6863 17.6863 8 21 8H190C206.569 8 220 21.4315 220 38V237C220 253.569 206.569 267 190 267H21C17.6863 267 15 264.314 15 261V14Z"
            fill="url(#paint0_linear_398_58)"
          />
          <g filter="url(#filter1_d_398_58)">
            <path
              d="M30.8779 8.146L30.8779 267.146"
              stroke="white"
              strokeOpacity="0.3"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              shapeRendering="crispEdges"
            />
          </g>
          <g filter="url(#filter2_d_398_58)">
            <path
              d="M59.9224 229V213.88H64.588C66.028 213.88 67.3024 214.204 68.4112 214.852C69.5344 215.486 70.4128 216.371 71.0464 217.509C71.68 218.646 71.9968 219.957 71.9968 221.44C71.9968 222.909 71.68 224.212 71.0464 225.35C70.4128 226.487 69.5344 227.38 68.4112 228.028C67.3024 228.676 66.028 229 64.588 229H59.9224ZM62.0392 227.013H64.588C65.3224 227.013 66.0064 226.876 66.64 226.602C67.2736 226.314 67.828 225.918 68.3032 225.414C68.7928 224.896 69.1672 224.298 69.4264 223.622C69.7 222.945 69.8368 222.218 69.8368 221.44C69.8368 220.662 69.7 219.935 69.4264 219.258C69.1672 218.582 68.7928 217.991 68.3032 217.487C67.828 216.969 67.2736 216.573 66.64 216.299C66.0064 216.011 65.3224 215.867 64.588 215.867H62.0392V227.013ZM79.1336 229.259C78.0824 229.259 77.1536 229.022 76.3472 228.546C75.5408 228.057 74.9072 227.387 74.4464 226.538C73.9856 225.688 73.7552 224.709 73.7552 223.6C73.7552 222.491 73.9856 221.512 74.4464 220.662C74.9072 219.813 75.5408 219.15 76.3472 218.675C77.168 218.186 78.104 217.941 79.1552 217.941C80.1488 217.941 81.02 218.193 81.7688 218.697C82.5176 219.186 83.1008 219.892 83.5184 220.814C83.9504 221.721 84.1664 222.794 84.1664 224.032H75.8504C75.9224 225.098 76.2752 225.933 76.9088 226.538C77.5568 227.128 78.3488 227.423 79.2848 227.423C80.0048 227.423 80.6024 227.258 81.0776 226.926C81.5672 226.581 81.9488 226.149 82.2224 225.63L83.9936 226.451C83.7056 227.013 83.3312 227.51 82.8704 227.942C82.4096 228.359 81.8624 228.683 81.2288 228.914C80.6096 229.144 79.9112 229.259 79.1336 229.259ZM75.98 222.412H81.9632C81.92 221.836 81.7616 221.354 81.488 220.965C81.2288 220.562 80.8904 220.252 80.4728 220.036C80.0696 219.82 79.616 219.712 79.112 219.712C78.6224 219.712 78.1472 219.82 77.6864 220.036C77.2256 220.238 76.8368 220.54 76.52 220.943C76.2176 221.346 76.0376 221.836 75.98 222.412ZM90.06 229.259C89.2968 229.259 88.6128 229.144 88.008 228.914C87.4176 228.683 86.9136 228.374 86.496 227.985C86.0928 227.596 85.7904 227.157 85.5888 226.667L87.36 225.89C87.5904 226.336 87.936 226.703 88.3968 226.991C88.8576 227.279 89.3688 227.423 89.9304 227.423C90.5496 227.423 91.0608 227.308 91.464 227.078C91.8672 226.847 92.0688 226.523 92.0688 226.106C92.0688 225.702 91.9176 225.386 91.6152 225.155C91.3128 224.925 90.8736 224.738 90.2976 224.594L89.2824 224.334C88.2744 224.061 87.4896 223.65 86.928 223.103C86.3808 222.556 86.1072 221.937 86.1072 221.246C86.1072 220.194 86.4456 219.381 87.1224 218.805C87.7992 218.229 88.8 217.941 90.1248 217.941C90.7728 217.941 91.3632 218.034 91.896 218.222C92.4432 218.409 92.904 218.675 93.2784 219.021C93.6672 219.366 93.9408 219.777 94.0992 220.252L92.3712 221.03C92.1984 220.598 91.9032 220.281 91.4856 220.079C91.068 219.863 90.5784 219.755 90.0168 219.755C89.4408 219.755 88.9872 219.885 88.656 220.144C88.3248 220.389 88.1592 220.734 88.1592 221.181C88.1592 221.426 88.296 221.663 88.5696 221.894C88.8576 222.11 89.2752 222.29 89.8224 222.434L90.9888 222.714C91.6944 222.887 92.2776 223.154 92.7384 223.514C93.1992 223.859 93.5448 224.255 93.7752 224.702C94.0056 225.134 94.1208 225.587 94.1208 226.062C94.1208 226.71 93.9408 227.279 93.5808 227.769C93.2352 228.244 92.7528 228.611 92.1336 228.87C91.5288 229.13 90.8376 229.259 90.06 229.259ZM96.3849 229V218.2H98.4369V229H96.3849ZM97.4217 215.91C97.0905 215.91 96.8025 215.788 96.5577 215.543C96.3129 215.284 96.1905 214.989 96.1905 214.658C96.1905 214.312 96.3129 214.024 96.5577 213.794C96.8025 213.549 97.0905 213.426 97.4217 213.426C97.7673 213.426 98.0553 213.549 98.2857 213.794C98.5305 214.024 98.6529 214.312 98.6529 214.658C98.6529 214.989 98.5305 215.284 98.2857 215.543C98.0553 215.788 97.7673 215.91 97.4217 215.91ZM105.916 233.601C105.196 233.601 104.54 233.529 103.95 233.385C103.36 233.255 102.863 233.104 102.46 232.931C102.056 232.758 101.754 232.607 101.552 232.478L102.33 230.814C102.517 230.93 102.784 231.059 103.129 231.203C103.475 231.362 103.878 231.491 104.339 231.592C104.8 231.707 105.311 231.765 105.872 231.765C106.535 231.765 107.125 231.628 107.644 231.354C108.162 231.095 108.565 230.685 108.853 230.123C109.156 229.562 109.307 228.842 109.307 227.963V226.84C108.932 227.474 108.436 227.97 107.816 228.33C107.197 228.676 106.499 228.849 105.721 228.849C104.742 228.849 103.885 228.626 103.151 228.179C102.431 227.718 101.862 227.085 101.444 226.278C101.041 225.458 100.84 224.514 100.84 223.449C100.84 222.34 101.041 221.375 101.444 220.554C101.862 219.734 102.431 219.093 103.151 218.632C103.885 218.171 104.742 217.941 105.721 217.941C106.499 217.941 107.197 218.121 107.816 218.481C108.436 218.826 108.932 219.33 109.307 219.993V218.2H111.359V227.92C111.359 229.158 111.121 230.195 110.646 231.03C110.185 231.88 109.544 232.521 108.724 232.953C107.917 233.385 106.981 233.601 105.916 233.601ZM106.24 227.121C106.844 227.121 107.37 226.962 107.816 226.646C108.263 226.314 108.616 225.875 108.875 225.328C109.134 224.766 109.264 224.126 109.264 223.406C109.264 222.686 109.134 222.052 108.875 221.505C108.616 220.958 108.256 220.533 107.795 220.23C107.348 219.914 106.823 219.755 106.218 219.755C105.584 219.755 105.023 219.914 104.533 220.23C104.058 220.533 103.684 220.958 103.41 221.505C103.136 222.052 103 222.686 103 223.406C103 224.126 103.136 224.766 103.41 225.328C103.698 225.875 104.08 226.314 104.555 226.646C105.044 226.962 105.606 227.121 106.24 227.121ZM114.206 229V218.2H116.128L116.215 219.777C116.575 219.186 117.036 218.733 117.597 218.416C118.173 218.099 118.828 217.941 119.563 217.941C120.412 217.941 121.147 218.114 121.766 218.459C122.4 218.805 122.882 219.345 123.213 220.079C123.559 220.799 123.732 221.75 123.732 222.93V229H121.68V223.47C121.68 222.491 121.564 221.75 121.334 221.246C121.118 220.727 120.808 220.367 120.405 220.166C120.016 219.964 119.563 219.856 119.044 219.842C118.166 219.842 117.482 220.151 116.992 220.77C116.503 221.39 116.258 222.261 116.258 223.384V229H114.206ZM132.084 229V213.88H134.201V229H132.084ZM141.726 229.259C140.646 229.259 139.81 228.986 139.22 228.438C138.63 227.877 138.334 227.078 138.334 226.041V219.971H136.498V218.2H138.334V214.83H140.386V218.2H143.454V219.971H140.386V225.738C140.386 226.271 140.516 226.682 140.775 226.97C141.049 227.243 141.438 227.38 141.942 227.38C142.086 227.38 142.244 227.351 142.417 227.294C142.59 227.236 142.798 227.121 143.043 226.948L143.821 228.546C143.446 228.791 143.086 228.971 142.741 229.086C142.41 229.202 142.071 229.259 141.726 229.259ZM151.617 229V213.88H153.734V229H151.617ZM160.956 229.259C160.193 229.259 159.509 229.144 158.904 228.914C158.314 228.683 157.81 228.374 157.392 227.985C156.989 227.596 156.686 227.157 156.485 226.667L158.256 225.89C158.486 226.336 158.832 226.703 159.293 226.991C159.754 227.279 160.265 227.423 160.826 227.423C161.446 227.423 161.957 227.308 162.36 227.078C162.763 226.847 162.965 226.523 162.965 226.106C162.965 225.702 162.814 225.386 162.511 225.155C162.209 224.925 161.77 224.738 161.194 224.594L160.178 224.334C159.17 224.061 158.386 223.65 157.824 223.103C157.277 222.556 157.003 221.937 157.003 221.246C157.003 220.194 157.342 219.381 158.018 218.805C158.695 218.229 159.696 217.941 161.021 217.941C161.669 217.941 162.259 218.034 162.792 218.222C163.339 218.409 163.8 218.675 164.174 219.021C164.563 219.366 164.837 219.777 164.995 220.252L163.267 221.03C163.094 220.598 162.799 220.281 162.382 220.079C161.964 219.863 161.474 219.755 160.913 219.755C160.337 219.755 159.883 219.885 159.552 220.144C159.221 220.389 159.055 220.734 159.055 221.181C159.055 221.426 159.192 221.663 159.466 221.894C159.754 222.11 160.171 222.29 160.718 222.434L161.885 222.714C162.59 222.887 163.174 223.154 163.634 223.514C164.095 223.859 164.441 224.255 164.671 224.702C164.902 225.134 165.017 225.587 165.017 226.062C165.017 226.71 164.837 227.279 164.477 227.769C164.131 228.244 163.649 228.611 163.03 228.87C162.425 229.13 161.734 229.259 160.956 229.259ZM168.08 229.302C167.72 229.302 167.403 229.173 167.13 228.914C166.871 228.654 166.741 228.338 166.741 227.963C166.741 227.589 166.871 227.272 167.13 227.013C167.403 226.754 167.72 226.624 168.08 226.624C168.455 226.624 168.771 226.754 169.031 227.013C169.304 227.272 169.441 227.589 169.441 227.963C169.441 228.338 169.304 228.654 169.031 228.914C168.771 229.173 168.455 229.302 168.08 229.302Z"
              fill="#F5F5F5"
            />
          </g>
        </g>
      </g>
      <defs>
        <filter
          id="filter0_ddddii_398_58"
          x="0"
          y="0"
          width="300"
          height="399"
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
          <feOffset dx="3" dy="6" />
          <feGaussianBlur stdDeviation="7" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_398_58" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="10" dy="23" />
          <feGaussianBlur stdDeviation="12.5" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.07 0" />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_398_58"
            result="effect2_dropShadow_398_58"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="23" dy="52" />
          <feGaussianBlur stdDeviation="17" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0" />
          <feBlend
            mode="normal"
            in2="effect2_dropShadow_398_58"
            result="effect3_dropShadow_398_58"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="40" dy="92" />
          <feGaussianBlur stdDeviation="20" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.01 0" />
          <feBlend
            mode="normal"
            in2="effect3_dropShadow_398_58"
            result="effect4_dropShadow_398_58"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect4_dropShadow_398_58"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
          <feBlend mode="normal" in2="shape" result="effect5_innerShadow_398_58" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="0.5" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend
            mode="normal"
            in2="effect5_innerShadow_398_58"
            result="effect6_innerShadow_398_58"
          />
        </filter>
        <filter
          id="filter1_d_398_58"
          x="26.3779"
          y="6.646"
          width="6"
          height="262"
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
          <feOffset dx="-3" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_398_58" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_398_58"
            result="shape"
          />
        </filter>
        <filter
          id="filter2_d_398_58"
          x="59.9224"
          y="212.426"
          width="109.519"
          height="21.1744"
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
          <feOffset dy="-1" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_398_58" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_398_58"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_398_58"
          x1="117.5"
          y1="8"
          x2="117.5"
          y2="267"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="#7B7B7B" />
        </linearGradient>
        <clipPath id="clip0_398_58">
          <path
            d="M15 14C15 10.6863 17.6863 8 21 8H190C206.569 8 220 21.4315 220 38V237C220 253.569 206.569 267 190 267H21C17.6863 267 15 264.314 15 261V14Z"
            fill="white"
          />
        </clipPath>
      </defs>
    </svg>
  );
};
const COVER_CLIP =
  "M28 8.99999C28 5.68629 30.6863 3 34 3H187C203.569 3 217 16.4315 217 33V232C217 248.569 203.569 262 187 262H34C30.6863 262 28 259.314 28 256V8.99999Z";

const BookBase = ({
  className,
  image,
}: {
  className?: string;
  /** Cover art URL (e.g. `/cover.jpg` or remote URL). Fills the book face with object-fit: cover behavior. */
  image?: string;
}) => {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      width="300"
      height="400"
      viewBox="0 0 300 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_ddddi_398_51)">
        <path
          d="M15 15C15 11.6863 17.6863 9 21 9H190C206.569 9 220 22.4315 220 39V238C220 254.569 206.569 268 190 268H21C17.6863 268 15 265.314 15 262V15Z"
          fill="#E3E3E4"
        />
        <path
          d="M15 15C15 11.6863 17.6863 9 21 9H190C206.569 9 220 22.4315 220 39V238C220 254.569 206.569 268 190 268H21C17.6863 268 15 265.314 15 262V15Z"
          fill="url(#paint0_linear_398_51)"
        />
        <path
          d="M56.9224 67V51.88H66.0808V53.824H59.0392V58.576H65.1736V60.52H59.0392V67H56.9224ZM68.3466 67V56.2H70.3986V67H68.3466ZM69.3834 53.9104C69.0522 53.9104 68.7642 53.788 68.5194 53.5432C68.2746 53.284 68.1522 52.9888 68.1522 52.6576C68.1522 52.312 68.2746 52.024 68.5194 51.7936C68.7642 51.5488 69.0522 51.4264 69.3834 51.4264C69.729 51.4264 70.017 51.5488 70.2474 51.7936C70.4922 52.024 70.6146 52.312 70.6146 52.6576C70.6146 52.9888 70.4922 53.284 70.2474 53.5432C70.017 53.788 69.729 53.9104 69.3834 53.9104ZM73.4061 67V51.88H75.4581V67H73.4061ZM78.2998 67V51.88H80.3518V67H78.2998ZM94.731 60.7144L92.8086 59.98L97.7118 51.88H100.174L94.731 60.7144ZM92.6358 67V59.7424H94.7742V67H92.6358ZM92.679 60.7144L87.2358 51.88H89.6766L94.5798 59.98L92.679 60.7144ZM105.203 67.2592C104.123 67.2592 103.173 67.0216 102.352 66.5464C101.531 66.0568 100.883 65.3872 100.408 64.5376C99.9473 63.688 99.7169 62.7088 99.7169 61.6C99.7169 60.4912 99.9473 59.512 100.408 58.6624C100.869 57.8128 101.51 57.1504 102.33 56.6752C103.151 56.1856 104.094 55.9408 105.16 55.9408C106.226 55.9408 107.169 56.1856 107.99 56.6752C108.81 57.1504 109.451 57.8128 109.912 58.6624C110.373 59.512 110.603 60.4912 110.603 61.6C110.603 62.7088 110.373 63.688 109.912 64.5376C109.451 65.3872 108.81 66.0568 107.99 66.5464C107.183 67.0216 106.254 67.2592 105.203 67.2592ZM105.203 65.38C105.851 65.38 106.427 65.2216 106.931 64.9048C107.435 64.5736 107.824 64.1272 108.098 63.5656C108.386 63.004 108.53 62.3488 108.53 61.6C108.53 60.8512 108.386 60.196 108.098 59.6344C107.824 59.0728 107.428 58.6336 106.91 58.3168C106.391 57.9856 105.808 57.82 105.16 57.82C104.498 57.82 103.914 57.9856 103.41 58.3168C102.906 58.6336 102.51 59.0728 102.222 59.6344C101.934 60.196 101.79 60.8512 101.79 61.6C101.79 62.3488 101.934 63.004 102.222 63.5656C102.51 64.1272 102.914 64.5736 103.432 64.9048C103.95 65.2216 104.541 65.38 105.203 65.38ZM120.195 67L120.066 65.0128V56.2H122.096V67H120.195ZM112.592 61.7296V56.2H114.644V61.7296H112.592ZM114.644 61.7296C114.644 62.6944 114.752 63.436 114.968 63.9544C115.199 64.4728 115.515 64.8328 115.919 65.0344C116.322 65.236 116.775 65.344 117.279 65.3584C118.158 65.3584 118.842 65.0488 119.331 64.4296C119.821 63.8104 120.066 62.9392 120.066 61.816H120.951C120.951 62.9536 120.779 63.9328 120.433 64.7536C120.102 65.56 119.627 66.1792 119.007 66.6112C118.388 67.0432 117.632 67.2592 116.739 67.2592C115.904 67.2592 115.17 67.0864 114.536 66.7408C113.917 66.3952 113.435 65.8552 113.089 65.1208C112.758 64.3864 112.592 63.436 112.592 62.2696V61.7296H114.644ZM126.212 61.1896C126.212 60.0232 126.435 59.0728 126.882 58.3384C127.328 57.604 127.904 57.0568 128.61 56.6968C129.315 56.3368 130.057 56.1568 130.834 56.1568V58.1008C130.186 58.1008 129.567 58.2016 128.977 58.4032C128.401 58.5904 127.926 58.9072 127.551 59.3536C127.191 59.7856 127.011 60.376 127.011 61.1248L126.212 61.1896ZM124.959 67V56.2H127.011V67H124.959ZM135.681 66.9775L135.748 66.775C136.851 66.5275 137.413 66.55 137.796 65.0875L140.946 52.915C141.351 51.34 140.676 51.655 139.776 51.25L139.821 51.07C141.711 51.07 143.578 51.07 145.468 51.07C147.538 51.07 148.821 52.7575 148.213 55.1425C147.741 56.965 146.233 58.2925 144.658 58.945C146.503 59.17 147.426 60.52 146.863 62.7475C146.143 65.515 143.758 66.9775 141.756 66.9775H135.681ZM140.991 59.305L139.101 66.505C139.731 66.5275 140.338 66.5725 140.968 66.5725C143.241 66.5725 144.388 65.4475 145.018 63.04C145.761 60.16 144.748 59.305 142.678 59.305H140.991ZM141.103 58.855C141.733 58.855 142.363 58.855 142.993 58.8325C144.838 58.7875 146.031 57.0325 146.526 55.165C147.246 52.3525 146.751 51.4975 144.231 51.4975H143.016L141.103 58.855ZM150.898 67.135C148.221 67.135 147.433 64.2775 148.153 61.5325C148.873 58.7875 151.101 55.9525 153.801 55.9525C156.478 55.9525 157.288 58.7875 156.591 61.5325C155.871 64.255 153.576 67.135 150.898 67.135ZM150.156 60.0475C149.661 61.9375 149.188 66.73 151.393 66.73C153.126 66.73 154.183 64.4575 154.566 62.9275C155.038 61.105 155.556 56.3125 153.396 56.3125C151.618 56.3125 150.583 58.45 150.156 60.0475ZM160.237 67.135C157.559 67.135 156.772 64.2775 157.492 61.5325C158.212 58.7875 160.439 55.9525 163.139 55.9525C165.817 55.9525 166.627 58.7875 165.929 61.5325C165.209 64.255 162.914 67.135 160.237 67.135ZM159.494 60.0475C158.999 61.9375 158.527 66.73 160.732 66.73C162.464 66.73 163.522 64.4575 163.904 62.9275C164.377 61.105 164.894 56.3125 162.734 56.3125C160.957 56.3125 159.922 58.45 159.494 60.0475ZM169.155 67H164.43L164.497 66.7075C165.577 66.4825 166.117 66.4825 166.477 65.0875L169.672 52.8475C170.077 51.295 170.257 50.4625 168.637 50.4625L168.772 50.08C169.672 50.0575 170.572 50.035 171.45 50.035H171.99L169.177 60.8125L172.732 57.775C172.935 57.595 173.205 57.1675 173.272 56.8975C173.385 56.5375 173.137 56.3575 172.867 56.3575L172.935 56.0425C173.587 56.0425 174.195 56.0875 174.825 56.0875C175.32 56.0875 175.86 56.065 176.377 56.065L176.31 56.335C174.78 56.56 174.42 56.6725 173.07 57.865L170.685 60.0025L172.372 65.1325C172.575 65.74 172.935 66.0325 173.295 66.0325C173.7 66.0325 174.127 65.6725 174.352 64.975L174.6 65.1325C174.285 66.1675 173.407 66.9325 172.507 66.9325C171.81 66.9325 171.112 66.46 170.73 65.2225L169.357 60.9475L169.087 61.195L168.075 65.0875C167.715 66.4825 168.255 66.4825 169.222 66.7075L169.155 67ZM176.396 67.135C173.516 67.135 173.898 64.255 174.821 64.255C174.911 64.255 175.023 64.3 175.136 64.3675C175.743 64.795 175.158 66.82 176.801 66.82C177.948 66.82 178.646 65.8525 178.848 64.975C179.546 62.32 175.563 61.825 176.283 58.99C176.756 57.1675 178.511 55.975 180.041 55.9525C182.268 55.885 182.021 58.45 180.918 58.2475C179.456 58 181.233 56.2675 179.951 56.2675C178.983 56.2675 177.836 56.9875 177.543 58.09C177.026 60.07 181.256 60.8125 180.423 64.0075C179.996 65.65 178.466 67.135 176.396 67.135Z"
          fill="#2C2C2C"
        />
      </g>
      <g clipPath="url(#bookCoverClip)">
        {image ? (
          <image
            href={image}
            x={28}
            y={2}
            width={189}
            height={259}
            preserveAspectRatio="xMidYMid slice"
          />
        ) : (
          <path d={COVER_CLIP} fill="white" />
        )}
      </g>
      <path
        d="M15 262V4C15 1.79086 16.7909 0 19 0H24C26.2091 0 28 1.79086 28 4V262C28 264.209 26.2091 266 24 266H19C16.7909 266 15 264.209 15 262Z"
        fill="#D8D8D8"
      />
      <path
        d="M15 262V4C15 1.79086 16.7909 0 19 0H24C26.2091 0 28 1.79086 28 4V262C28 264.209 26.2091 266 24 266H19C16.7909 266 15 264.209 15 262Z"
        fill="url(#paint1_linear_398_51)"
      />
      <defs>
        <clipPath id="bookCoverClip">
          <path d={COVER_CLIP} />
        </clipPath>
        <filter
          id="filter0_ddddi_398_51"
          x="0"
          y="1"
          width="300"
          height="399"
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
          <feOffset dx="3" dy="6" />
          <feGaussianBlur stdDeviation="7" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_398_51" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="10" dy="23" />
          <feGaussianBlur stdDeviation="12.5" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.07 0" />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_398_51"
            result="effect2_dropShadow_398_51"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="23" dy="52" />
          <feGaussianBlur stdDeviation="17" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0" />
          <feBlend
            mode="normal"
            in2="effect2_dropShadow_398_51"
            result="effect3_dropShadow_398_51"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="40" dy="92" />
          <feGaussianBlur stdDeviation="20" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.01 0" />
          <feBlend
            mode="normal"
            in2="effect3_dropShadow_398_51"
            result="effect4_dropShadow_398_51"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect4_dropShadow_398_51"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
          <feBlend mode="normal" in2="shape" result="effect5_innerShadow_398_51" />
        </filter>
        <linearGradient
          id="paint0_linear_398_51"
          x1="117.5"
          y1="9"
          x2="117.5"
          y2="268"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="#7B7B7B" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_398_51"
          x1="21.5"
          y1="0"
          x2="21.5"
          y2="266"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#AAAAAA" />
          <stop offset="1" stopColor="white" />
        </linearGradient>
      </defs>
    </svg>
  );
};
