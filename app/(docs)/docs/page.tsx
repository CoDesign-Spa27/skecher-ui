"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
 
import { usePrefersFineHover } from "@/hooks/use-prefers-fine-hovers";
import { COMPONENT_DOCS } from "@/lib/docs-content";
import { ArrowRight, PlayCircle } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import Link from "next/link";

const DOC_STEPS = [
    {
        title: "Pick a component",
        body: "Start with a motion primitive that matches the moment you are building.",
    },
    {
        title: "Install only what it needs",
        body: "Each page lists its command, dependencies, source file, and usage example.",
    },
    {
        title: "Shape it in your UI",
        body: "The components are made to inherit your layout, type scale, and interaction style.",
    },
];

const VIDEO_BASE_URL =
    "https://skecher-ui.com/skecher-components/edit-video-projects";

const COMPONENT_VIDEOS = COMPONENT_DOCS.map((component, index) => ({
    ...component,
    videoUrl: `${VIDEO_BASE_URL}/skecher${index + 1}.mp4`,
}));

type ComponentVideo = (typeof COMPONENT_VIDEOS)[number];

const PILL_TRANSITION = {
    type: "spring",
    duration: 0.3,
    bounce: 0,
} as const;

function VideoCard({ component }: { component: ComponentVideo }) {
    const cardRef = useRef<HTMLElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const prefersFineHover = usePrefersFineHover();
    const [shouldMountVideo, setShouldMountVideo] = useState(false);
    const [hasPreviewFrame, setHasPreviewFrame] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const shouldReduceMotion = useReducedMotion();
    const showTitle = prefersFineHover ? isHovered : true;
    const pillLayoutId = `component-video-pill-${component.slug}`;
    const pillTransition = shouldReduceMotion
        ? { duration: 0.01 }
        : PILL_TRANSITION;

    /**
     * Mount video before user hovers when the card is near viewport.
     * This lets browser fetch metadata / first frame early.
     */
    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;

                setShouldMountVideo(true);
                observer.disconnect();
            },
            {
                rootMargin: "500px",
                threshold: 0.01,
            }
        );

        observer.observe(card);

        return () => observer.disconnect();
    }, []);

    const handlePreviewReady = () => {
        const video = videoRef.current;
        if (!video) return;

        /**
         * This helps some browsers paint the first frame instead of a blank box.
         */
        try {
            if (video.currentTime === 0) {
                video.currentTime = 0.001;
            }
        } catch {
            // Some browsers may block tiny seek before full metadata is ready.
        }

        setHasPreviewFrame(true);
    };

    const playVideo = async () => {
        setShouldMountVideo(true);

        requestAnimationFrame(async () => {
            const video = videoRef.current;
            if (!video) return;

            try {
                /**
                 * On hover we allow browser to buffer more.
                 * Before hover, preload stays light.
                 */
                video.preload = "auto";

                if (video.readyState < 2) {
                    video.load();
                }

                await video.play();
                setIsPlaying(true);
            } catch {
                setIsPlaying(false);
            }
        });
    };

    const stopVideo = () => {
        const video = videoRef.current;
        if (!video) return;

        video.pause();

        /**
         * Reset back to preview frame.
         * Do not remove src, otherwise browser may lose cache benefit.
         */
        try {
            video.currentTime = 0.001;
        } catch {
            video.currentTime = 0;
        }

        setIsPlaying(false);
    };

    const handleEnter = () => {
        setIsHovered(true);
        void playVideo();
    };

    const handleExit = () => {
        setIsHovered(false);
        stopVideo();
    };

    return (
        <Link
            href={`/docs/${component.slug}`}
            className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            onPointerEnter={handleEnter}
            onPointerLeave={handleExit}
            onFocus={handleEnter}
            onBlur={handleExit}
        >
            <article
                ref={cardRef}
                className="component-preview-css overflow-hidden rounded-xl bg-card p-1 text-card-foreground transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]  "
            >
                <div className="relative aspect-video overflow-hidden bg-muted rounded-xl">
                    {!hasPreviewFrame ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                            <PlayCircle className="size-7 text-muted-foreground/50" />
                        </div>
                    ) : null}

                    {shouldMountVideo ? (
                        <video
                            ref={videoRef}
                            src={component.videoUrl}
                            className={[
                                "absolute inset-0 h-full rounded-xl w-full object-cover transition-opacity duration-200",
                                hasPreviewFrame ? "opacity-100" : "opacity-0",
                            ].join(" ")}
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            aria-label={`${component.title} component video`}
                            tabIndex={-1}
                            onLoadedData={handlePreviewReady}
                            onCanPlay={handlePreviewReady}
                        />
                    ) : null}

                    <LayoutGroup id={`component-video-card-${component.slug}`}>
                        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4">
                            <AnimatePresence mode="popLayout" initial={false}>
                                {showTitle ? (
                                    <motion.div
                                        key="title-pill"
                                        layoutId={pillLayoutId}
                                        transition={pillTransition}
                                        style={{ borderRadius: 999 }}
                                        className=" relative max-w-[calc(100%-2rem)] overflow-hidden bg-sidebar/90 px-4 py-1.5 backdrop-blur-sm"
                                    >
                                
                                            <motion.p
                                                key="title"
                                                initial={{
                                                    transition: {
                                                        duration: 0.22,
                                                        ease: "easeOut",
                                                    },
                                                    opacity: 0,
                                                    y: shouldReduceMotion ? 0 : 12,
                                                    filter: shouldReduceMotion ? "blur(0px)" : "blur(10px)",
                                                }}
                                                animate={{
                                                    transition: {
                                                        duration: 0.22,
                                                        ease: "easeOut",
                                                    },
                                                    opacity: 1,
                                                    y: 0,
                                                    filter: "blur(0px)",
                                                }}
                                                exit={{
                                                    transition: {
                                                        duration: 0.22,
                                                        ease: "easeOut",
                                                    },
                                                    opacity: 0,
                                                    y: shouldReduceMotion ? 0 : 12,
                                                    filter: shouldReduceMotion ? "blur(0px)" : "blur(10px)",
                                                }}
                                            
                                                style={{
                                                    willChange: "opacity, transform, filter",
                                                }}
                                                className="relative z-20 truncate text-sm font-medium text-foreground"
                                            >
                                                {component.title}
                                            </motion.p>
                               
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="idle-pill"
                                        layoutId={pillLayoutId}
                                        transition={pillTransition}
                                        style={{ borderRadius: 999 }}
                                        className=" h-2.5 w-16 bg-sidebar/85 backdrop-blur-sm"
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </LayoutGroup>

                    {!isPlaying ? (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            <div className="rounded-full bg-black/45 p-2 text-white backdrop-blur-sm">
                                <PlayCircle className="size-7" aria-hidden="true" />
                            </div>
                        </div>
                    ) : null}

                    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5" />
                </div>
            </article>
        </Link>
    );
}

export default function Page() {
    return (
        <main className="page mx-auto flex min-h-full w-full max-w-5xl flex-col px-5 py-8 sm:px-8 lg:px-10">
            <header className="max-w-3xl border-b border-border pb-10 pt-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Skecher UI Docs
                </p>

                <h1 className="mt-4 font-raleway text-4xl font-light tracking-normal text-foreground sm:text-5xl">
                    Animated React components built to stay out of your way.
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                    Explore focused motion components, copy the source into your project,
                    and keep full control over the final interface.
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                    <Button asChild>
                        <Link href="/docs/streaming-text">
                            Start with Streaming Text
                            <ArrowRight />
                        </Link>
                    </Button>

                    <Button asChild variant="ghost">
                        <Link href="#components">Browse components</Link>
                    </Button>
                </div>
            </header>

            <section
                aria-labelledby="docs-flow-title"
                className="grid gap-8 border-b border-border py-10 md:grid-cols-[minmax(0,1fr)_minmax(18rem,1fr)]"
            >
                <div>
                    <h2
                        id="docs-flow-title"
                        className="font-raleway text-2xl font-light tracking-normal text-foreground"
                    >
                        A short path from demo to product.
                    </h2>

                    <p className="mt-3 max-w-xl leading-7 text-muted-foreground">
                        These docs keep the workflow close to the code: preview the
                        component, install its small dependency set, then adapt the source to
                        your system.
                    </p>
                </div>

                <ol className="divide-y divide-border border-y border-border">
                    {DOC_STEPS.map((step, index) => (
                        <li key={step.title} className="grid grid-cols-[2rem_1fr] gap-4 py-4">
                            <span className="text-sm tabular-nums text-muted-foreground">
                                {String(index + 1).padStart(2, "0")}
                            </span>

                            <div>
                                <h3 className="text-sm font-medium text-foreground">
                                    {step.title}
                                </h3>

                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    {step.body}
                                </p>
                            </div>
                        </li>
                    ))}
                </ol>
            </section>

            <section id="components" aria-labelledby="components-title" className="py-10">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                            Component videos
                        </p>

                        <h2
                            id="components-title"
                            className="mt-3 font-raleway text-2xl font-light tracking-normal text-foreground"
                        >
                            Watch the pieces in motion.
                        </h2>
                    </div>

                    <p className="max-w-md text-sm leading-6 text-muted-foreground">
                        Each card uses the Cloudflare-hosted Skecher video series and links
                        back to the matching component docs.
                    </p>
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {COMPONENT_VIDEOS.map((component) => (
                        <VideoCard key={component.slug} component={component} />
                    ))}
                </div>
            </section>
        </main>
    );
}
