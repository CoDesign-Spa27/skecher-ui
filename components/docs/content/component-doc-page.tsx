export function ComponentDocPage({ children }: { children: React.ReactNode }) {
  return (
    <article className="flex min-h-full w-full flex-col">
      <div className="w-full">{children}</div>
    </article>
  );
}
