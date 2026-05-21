import { Button } from "@/components/ui/button";
import { COMPONENT_DOCS } from "@/lib/docs-content";
import { ArrowRight } from "lucide-react";
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

const Page = () => {
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
                    Explore focused motion components, copy the source into your project, and
                    keep full control over the final interface.
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
                        These docs keep the workflow close to the code: preview the component,
                        install its small dependency set, then adapt the source to your system.
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
                            Components
                        </p>
                        <h2
                            id="components-title"
                            className="mt-3 font-raleway text-2xl font-light tracking-normal text-foreground"
                        >
                            Start with the pieces available today.
                        </h2>
                    </div>
                    <p className="max-w-md text-sm leading-6 text-muted-foreground">
                        Every page includes a live preview, installation guidance, source, and a
                        usage snippet.
                    </p>
                </div>

                <div className="mt-7 divide-y divide-border border-y border-border">
                    {COMPONENT_DOCS.map((component) => (
                        <Link
                            key={component.slug}
                            href={`/docs/${component.slug}`}
                            className="group grid gap-3 py-5 transition-colors hover:text-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:grid-cols-[minmax(10rem,13rem)_1fr_auto] sm:items-center"
                        >
                            <h3 className="font-medium text-foreground transition-colors group-hover:text-highlight">
                                {component.title}
                            </h3>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                {component.description}
                            </p>
                            <ArrowRight
                                aria-hidden="true"
                                className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-highlight"
                            />
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    );
};

export default Page;
