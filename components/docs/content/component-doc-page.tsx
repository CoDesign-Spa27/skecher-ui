export function ComponentDocPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <article className="page flex h-full flex-col px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </article>
  );
}
