import { getComponentPreview } from "@/components/docs/content/component-previews";
import { COMPONENT_DOCS, getComponentDoc } from "@/lib/docs-content";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return COMPONENT_DOCS.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getComponentDoc(slug);

  return {
    title: page ? `${page.title} Preview` : "Component Preview",
  };
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

  if (slug === "liquid-morphology-slideshow") {
    return <main className="h-svh w-full overflow-hidden bg-black">{preview}</main>;
  }

  return (
    <main className="flex min-h-svh w-full items-center justify-center overflow-auto bg-background p-6">
      <div className="flex min-h-[min(42rem,calc(100svh-3rem))] w-full items-center justify-center">
        {preview}
      </div>
    </main>
  );
}
