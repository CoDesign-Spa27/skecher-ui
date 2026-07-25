import Link from "next/link";

import { Hero } from "./Hero";

export default function Page() {
  return (
    <main className="min-h-svh bg-[#171717] text-white">
      <Hero />

      {/* <section
        aria-labelledby="landing-library-title"
        className="relative px-6 py-20 sm:px-10 sm:py-28 lg:px-16"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <h2
              id="landing-library-title"
              className="text-balance font-urbanist text-4xl leading-[1.02] font-medium tracking-[-0.035em] sm:text-5xl lg:text-6xl"
            >
              React motion components you can inspect, copy, and own.
            </h2>
            <p className="mt-6 max-w-[68ch] text-pretty font-urbanist text-lg leading-8 text-white/70">
              Skecher UI is an open-source component registry for expressive React interfaces.
              Explore each interaction in a live preview, tune selected components with DialKit, and
              copy the source into your own design system without giving up control of the
              implementation.
            </p>
          </div>

          <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-3">
            <article>
              <h3 className="font-urbanist text-xl font-medium">Preview real behavior</h3>
              <p className="mt-3 text-pretty font-urbanist leading-7 text-white/65">
                Evaluate scroll, pointer, spring, shader, and layout interactions directly in the
                browser before adding a component to your project.
              </p>
            </article>

            <article>
              <h3 className="font-urbanist text-xl font-medium">Adapt the source</h3>
              <p className="mt-3 text-pretty font-urbanist leading-7 text-white/65">
                Install through the shadcn-compatible registry or copy the TypeScript source, then
                adjust the styling, motion physics, content, and composition for your product.
              </p>
            </article>

            <article>
              <h3 className="font-urbanist text-xl font-medium">Ship accessible motion</h3>
              <p className="mt-3 text-pretty font-urbanist leading-7 text-white/65">
                Components include responsive behavior and reduced-motion considerations so visual
                polish does not come at the expense of usability.
              </p>
            </article>
          </div>

          <div className="mt-20 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <h2 className="font-urbanist text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
                Start with the component, finish with your system.
              </h2>
              <p className="mt-4 text-pretty font-urbanist leading-7 text-white/65">
                Browse installation details, dependencies, live controls, and complete source files
                for every component in the library.
              </p>
            </div>

            <Link
              className="inline-flex min-h-11 shrink-0 items-center rounded-md bg-white px-5 font-urbanist font-medium text-[#171717] transition-transform duration-150 ease-out hover:translate-y-[-1px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:translate-y-0 motion-reduce:transform-none"
              href="/docs"
            >
              Explore components
            </Link>
          </div>
        </div>
      </section> */}
    </main>
  );
}
