import { ComponentDocPage } from "@/components/docs/content/component-doc-page";
import { StreamingTextDoc } from "@/components/docs/content/streaming-text-doc";
import { COMPONENT_DOCS, getComponentDoc } from "@/lib/docs-content";
import { notFound } from "next/navigation";

const COMPONENT_RENDERERS = {
  "streaming-text": StreamingTextDoc,
} satisfies Record<string, () => Promise<React.ReactNode>>;

export function generateStaticParams() {
  return COMPONENT_DOCS.map((page) => ({
    slug: page.slug,
  }));
}

export default async function ComponentDocsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getComponentDoc(slug);
  const ComponentDoc = COMPONENT_RENDERERS[slug as keyof typeof COMPONENT_RENDERERS];

  if (!page || !ComponentDoc) {
    notFound();
  }

  return (
    <ComponentDocPage page={page}>
      <ComponentDoc />
    </ComponentDocPage>
  );
}

