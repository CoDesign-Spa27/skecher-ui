import type { ComponentDoc } from "@/lib/docs-content";

export function ComponentDocPage({
  children,
  page,
}: {
  children: React.ReactNode;
  page: ComponentDoc;
}) {
  return (
    <article className="page flex h-full flex-col px-5 py-8 sm:px-8 lg:px-10">
      <header className="mx-auto mb-8 w-full max-w-5xl space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {page.eyebrow}
        </p>
        <h1 className="font-raleway text-4xl font-light tracking-normal text-foreground">
          {page.title}
        </h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">{page.description}</p>
      </header>

      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </article>
  );
}

