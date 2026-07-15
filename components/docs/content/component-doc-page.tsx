export function ComponentDocPage({ children }: { children: React.ReactNode }) {
  return (
    <article className="flex h-full min-h-0 w-full flex-col">
      <div className="h-full min-h-0 w-full">{children}</div>
    </article>
  );
}
