import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getComponentPreview } from "@/components/docs/content/component-previews";
import { COMPONENT_DOCS, getComponentDoc } from "@/lib/docs-content";
import { createMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return COMPONENT_DOCS.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getComponentDoc(slug);

  return createMetadata({
    title: page ? `${page.title} Preview` : "Component Preview",
    description: page
      ? `Isolated preview for the ${page.title} React motion component.`
      : "Isolated component preview.",
    path: `/preview/${slug}`,
    noIndex: true,
  });
}

export default async function ComponentPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const preview = getComponentPreview(slug);

  if (!preview) {
    notFound();
  }

  //not using for slug === "liquid-morphology-slideshow" ||  now )
  if (slug === "interactive-grid-hero" || slug === "snap-text" || slug === "scroll-reveal-text") {
    return <main className="h-svh w-full overflow-hidden">{preview}</main>;
  }

  if (slug === "ai-orb") {
    return (
      <main className="flex h-screen w-full  items-center justify-center overflow-hidden p-6  dark:bg-[#070707] ">
        {preview}
      </main>
    );
  }

  return (
    <main className="flex min-h-screen h-full w-full items-center justify-center overflow-auto bg-background dark:bg-[#070707]  p-6">
      <div className="flex min-h-[min(42rem,calc(100svh-3rem))] w-full h-full items-center justify-center dark:bg-[#070707]">
        {preview}
      </div>
    </main>
  );
}
