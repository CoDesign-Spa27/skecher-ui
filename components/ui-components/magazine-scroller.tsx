"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useAnimationFrame, motion, useMotionValue, useSpring, useTransform, useVelocity, type MotionValue } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ProgressiveBlur } from "../ui/progressive-blur";

type Poster = {
    src: string;
    alt?: string;
};

type MagazineScrollerProps = {
    images?: Poster[];
    cardWidth?: number;
    cardHeight?: number;
    gap?: number;
    slices?: number;
    height?: number | string;
    wheelSpeed?: number;
    dragSpeed?: number;
    autoSpeed?: number;
    bendStrength?: number;
    maxBend?: number;
    lockWheel?: boolean;
    className?: string;
};

const DEFAULT_IMAGES: Poster[] = Array.from({ length: 18 }, (_, index) => ({
    src: `https://picsum.photos/seed/magazine-picsum-${index + 1}/700/1050`,
    alt: `Magazine poster ${index + 1}`,
}));

const SPRING = {
    mass: 0.28,
    stiffness: 95,
    damping: 24,
};

const VELOCITY_SPRING = {
    mass: 0.18,
    stiffness: 80,
    damping: 34,
};

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function wrap(min: number, max: number, value: number) {
    const range = max - min;
    if (range === 0) return min;
    return ((((value - min) % range) + range) % range) + min;
}

function toCssSize(value: number | string) {
    return typeof value === "number" ? `${value}px` : value;
}

export function MagazineScroller({
    images,
    cardWidth = 170,
    cardHeight = 250,
    gap = 34,
    slices = 9,
    height = "56vh",
    wheelSpeed = 1.15,
    dragSpeed = 1.15,
    autoSpeed = 0,
    bendStrength = 82,
    maxBend = 100,
    lockWheel = true,
    className,
}: MagazineScrollerProps) {
    const rootRef = useRef<HTMLElement | null>(null);
    const dragStartXRef = useRef(0);
    const dragStartValueRef = useRef(0);
    const isDraggingRef = useRef(false);

    const [containerWidth, setContainerWidth] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const targetX = useMotionValue(0);
    const x = useSpring(targetX, SPRING);

    const safeImages = useMemo(() => {
        return images?.length ? images : DEFAULT_IMAGES;
    }, [images]);

    const safeSlices = Math.max(1, Math.floor(slices));
    const itemStep = cardWidth + gap;
    const loopWidth = safeImages.length * itemStep;

    const loopX = useTransform(x, (latest) => {
        return wrap(-loopWidth, 0, latest);
    });

    const velocity = useVelocity(x);

    const smoothVelocity = useSpring(velocity, VELOCITY_SPRING);

    const bend = useTransform(smoothVelocity, (latest) => {
        return clamp(latest / bendStrength, -maxBend, maxBend);
    });

    useEffect(() => {
        const node = rootRef.current;
        if (!node) return;

        const updateSize = () => {
            setContainerWidth(node.clientWidth);
        };

        updateSize();

        const observer = new ResizeObserver(updateSize);
        observer.observe(node);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const node = rootRef.current;
        if (!node || !lockWheel) return;

        const handleWheel = (event: WheelEvent) => {
            const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

            if (!delta) return;

            event.preventDefault();
            targetX.set(targetX.get() - delta * wheelSpeed);
        };

        node.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            node.removeEventListener("wheel", handleWheel);
        };
    }, [lockWheel, targetX, wheelSpeed]);

    useAnimationFrame((_, delta) => {
        if (!autoSpeed || isDraggingRef.current) return;

        targetX.set(targetX.get() - autoSpeed * (delta / 1000));
    });

    const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
        if (event.button !== 0) return;

        isDraggingRef.current = true;
        setIsDragging(true);

        dragStartXRef.current = event.clientX;
        dragStartValueRef.current = targetX.get();

        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
        if (!isDraggingRef.current) return;

        const distance = event.clientX - dragStartXRef.current;
        targetX.set(dragStartValueRef.current + distance * dragSpeed);
    };

    const stopDragging = (event: ReactPointerEvent<HTMLElement>) => {
        if (!isDraggingRef.current) return;

        isDraggingRef.current = false;
        setIsDragging(false);

        try {
            event.currentTarget.releasePointerCapture(event.pointerId);
        } catch {
            // Pointer may already be released by the browser.
        }
    };

    // === ProgressiveBlur implementation ===
    // We'll render a left and right <ProgressiveBlur> element overlayed on top
    // with pointerEvents: "none" so they do not block scroll/drag.

    return (
        <section
            ref={rootRef}
            className={className}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
            style={{
                position: "relative",
                height: toCssSize(height),
                width: "100%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                cursor: isDragging ? "grabbing" : "grab",
                userSelect: "none",
                touchAction: "pan-y",
                perspective: 1400,
            }}
        >
            {/* LEFT progressive blur */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 56,
                    height: "100%",
                    zIndex: 2,
                    pointerEvents: "none",
                }}
            >
                <ProgressiveBlur
                    position="right"              
                    width="100%"
                    height="100%"
               
                />
            </div>
       
            <motion.div
                style={{
                    x: loopX,
                    display: "flex",
                    alignItems: "center",
                    gap,
                    transformStyle: "preserve-3d",
                    willChange: "transform",
                }}
            >
                {[0, 1, 2].map((copyIndex) =>
                    safeImages.map((image, index) => {
                        const absoluteIndex = copyIndex * safeImages.length + index;

                        return (
                            <PosterCard
                                key={`${copyIndex}-${image.src}-${index}`}
                                image={image}
                                absoluteIndex={absoluteIndex}
                                loopX={loopX}
                                bend={bend}
                                cardWidth={cardWidth}
                                cardHeight={cardHeight}
                                itemStep={itemStep}
                                slices={safeSlices}
                                containerWidth={containerWidth}
                            />
                        );
                    }),
                )}
            </motion.div>
         
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 56,
                    height: "100%",
                    zIndex: 2,
                    pointerEvents: "none",
                }}
            >
                <ProgressiveBlur
                    position="left"
                    width="100%"
                    height="100%" 
                />
            </div>
        </section>
    );
}

type PosterCardProps = {
    image: Poster;
    absoluteIndex: number;
    loopX: MotionValue<number>;
    bend: MotionValue<number>;
    cardWidth: number;
    cardHeight: number;
    itemStep: number;
    slices: number;
    containerWidth: number;
};

function PosterCard({
    image,
    absoluteIndex,
    loopX,
    bend,
    cardWidth,
    cardHeight,
    itemStep,
    slices,
    containerWidth,
}: PosterCardProps) {
    const cardCenter = useTransform(loopX, (latestX) => {
        return latestX + absoluteIndex * itemStep + cardWidth / 1;
    });

    const rotateY = useTransform(cardCenter, (center) => {
        if (!containerWidth) return 0;

        const viewportCenter = containerWidth / 2;
        const distance = (center - viewportCenter) / viewportCenter;

        return clamp(distance * -62, -76, 76);
    });

    const scale = useTransform(cardCenter, (center) => {
        if (!containerWidth) return 1;

        const viewportCenter = containerWidth / 2;
        const distance = Math.abs(center - viewportCenter) / viewportCenter;

        return clamp(1 - distance * 0.15, 0.82, 1);
    });

    const opacity = useTransform(cardCenter, (center) => {
        if (!containerWidth) return 1;

        const viewportCenter = containerWidth / 2;
        const distance = Math.abs(center - viewportCenter) / viewportCenter;

        return clamp(1 - distance * 0.38, 0.48, 1);
    });

    const y = useTransform(cardCenter, (center) => {
        if (!containerWidth) return 0;

        const viewportCenter = containerWidth / 2;
        const distance = Math.abs(center - viewportCenter) / viewportCenter;

        return clamp(distance * 30, 0, 44);
    });

    const rotateZ = useTransform(bend, (latest) => latest * 0.080);

    return (
        <motion.article
            aria-label={image.alt ?? "Magazine poster"}
            style={{
                width: cardWidth,
                height: cardHeight,
                flex: "0 0 auto",
                y,
                rotateY,
                rotateZ,
                scale,
                opacity,
                transformPerspective: 1200,
                transformStyle: "preserve-3d",
                willChange: "transform",
            }}
        >
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    overflow: "hidden",
                    borderRadius: 4,
 
                    transformStyle: "preserve-3d",
                }}
            >
                {Array.from({ length: slices }).map((_, sliceIndex) => (
                    <PosterSlice
                        key={`${image.src}-${sliceIndex}`}
                        src={image.src}
                        sliceIndex={sliceIndex}
                        slices={slices}
                        bend={bend}
                    />
                ))}
            </div>
        </motion.article>
    );
}

type PosterSliceProps = {
    src: string;
    sliceIndex: number;
    slices: number;
    bend: MotionValue<number>;
};

function PosterSlice({ src, sliceIndex, slices, bend }: PosterSliceProps) {
    const middle = (slices - 1) / 2;
    const offsetFromMiddle = sliceIndex - middle;

    const sliceRotateY = useTransform(bend, (latest) => {
        return latest * offsetFromMiddle * 0.22;
    });

    const sliceSkewY = useTransform(bend, (latest) => {
        return latest * offsetFromMiddle * 0.014;
    });

    const sliceZ = useTransform(bend, (latest) => {
        return Math.abs(latest) * Math.abs(offsetFromMiddle) * -0.18;
    });

    const backgroundPosition = slices === 1 ? "50% 50%" : `${(sliceIndex / (slices - 1)) * 100}% 50%`;

    return (
        <motion.div
            style={{
                width: `${100 / slices}%`,
                height: "100%",
                rotateY: sliceRotateY,
                skewY: sliceSkewY,
                z: sliceZ,
                transformOrigin: "center center",
                backgroundImage: `url(${src})`,
                backgroundSize: `${slices * 100}% 100%`,
                backgroundPosition,
                backgroundRepeat: "no-repeat",
                backfaceVisibility: "hidden",
                willChange: "transform",
            }}
        />
    );
}

export default MagazineScroller;