import type { DocsPage, DocsSection } from "@/lib/docs-content";

function SectionTable({ table }: Pick<DocsSection, "table">) {
  if (!table) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-md border bg-background">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b bg-muted/60 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              {table.headers.map((header) => (
                <th className="px-4 py-3 font-medium" key={header}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr className="border-b last:border-b-0" key={row.join("-")}>
                {row.map((cell) => (
                  <td className="px-4 py-3 align-top text-muted-foreground" key={cell}>
                    <code className="font-mono text-foreground">{cell}</code>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectionCommands({ commands }: Pick<DocsSection, "commands">) {
  if (!commands?.length) {
    return null;
  }

  return (
    <div className="space-y-2">
      {commands.map((command) => (
        <pre
          className="overflow-x-auto rounded-md border bg-background px-4 py-3 font-mono text-sm text-foreground"
          key={command}
        >
          {command}
        </pre>
      ))}
    </div>
  );
}

function SectionTree({ tree }: Pick<DocsSection, "tree">) {
  if (!tree?.length) {
    return null;
  }

  return (
    <pre className="overflow-x-auto rounded-md border bg-background p-4 font-mono text-sm leading-7 text-muted-foreground">
      {tree.join("\n")}
    </pre>
  );
}

function SectionCards({ cards }: Pick<DocsSection, "cards">) {
  if (!cards?.length) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div className="rounded-md border bg-background p-4" key={card.title}>
          <h3 className="font-medium text-foreground">{card.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{card.body}</p>
        </div>
      ))}
    </div>
  );
}

function StructuredSection({ section }: { section: DocsSection }) {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
        {section.body ? (
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{section.body}</p>
        ) : null}
      </div>

      {section.bullets?.length ? (
        <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
          {section.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      ) : null}

      <SectionCards cards={section.cards} />
      <SectionTable table={section.table} />
      <SectionCommands commands={section.commands} />
      <SectionTree tree={section.tree} />
    </section>
  );
}

export function StructuredDocPage({ page }: { page: DocsPage }) {
  return (
    <article className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 py-8 sm:px-8 lg:px-10">
      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {page.eyebrow}
        </p>
        <h1 className="font-raleway text-4xl font-light tracking-normal text-foreground">
          {page.title}
        </h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">{page.description}</p>
      </header>

      <div className="space-y-10">
        {page.sections.map((section) => (
          <StructuredSection key={section.title} section={section} />
        ))}
      </div>
    </article>
  );
}

