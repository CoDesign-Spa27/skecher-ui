"use client";

import { DocsToc } from "@/components/ui-components/table-of-content";

const sections = [
  { title: "Introduction", children: [] },
  { title: "Getting started", children: [] },
  { title: "Foundations", children: [] },
  { title: "Components", children: ["Navigation", "Forms"] },
  { title: "Guides", children: [] },
  { title: "API reference", children: [] },
  { title: "Examples", children: [] },
  { title: "Resources", children: [] },
] as const;

export function TableOfContentPreview() {
  return (
    <div className="mx-auto grid h-[700px] w-full max-w-4xl grid-cols-[minmax(0,1fr)_11rem] gap-3 overflow-hidden rounded-xl p-3 sm:grid-cols-[minmax(0,1fr)_14rem] sm:gap-8 sm:p-6">
      <article
        aria-label="Example article"
        className="no-scrollbar min-h-0 overflow-y-auto pb-80 pr-2 sm:pr-4"
      >
        <h1 className="truncate text-3xl font-semibold tracking-tight sm:text-4xl">
          Build with Skecher
        </h1>
        <p className="mb-12 mt-4 truncate text-base leading-7 text-muted-foreground">
          Scroll to see the outline follow each heading.
        </p>
        {sections.map((section, sectionIndex) => {
          const id = `toc-preview-${sectionIndex}`;
          return (
            <section className="mb-14" key={id}>
              <h2 className="scroll-mt-10 truncate text-2xl font-semibold" data-toc id={id}>
                {section.title}
              </h2>
              <p className="mt-3 truncate text-base leading-7 text-muted-foreground">
                Explore {section.title.toLowerCase()} in Skecher UI.
              </p>
              {section.children.map((child, childIndex) => (
                <div className="mt-9" key={child}>
                  <h3
                    className="scroll-mt-10 truncate text-lg font-semibold"
                    data-toc="3"
                    id={`${id}-${childIndex}`}
                  >
                    {child}
                  </h3>
                  <p className="mt-3 truncate text-base leading-7 text-muted-foreground">
                    Learn the essentials of {child.toLowerCase()}.
                  </p>
                </div>
              ))}
            </section>
          );
        })}
      </article>
      <DocsToc className="min-w-0 self-start" />
    </div>
  );
}
