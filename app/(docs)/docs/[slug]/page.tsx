import { ComponentDocPage } from "@/components/docs/content/component-doc-page";
import { DOC_RENDERERS } from "@/components/docs/content/generated-doc-renderers";
import { COMPONENT_DOCS, getComponentDoc } from "@/lib/docs-content";
import { notFound } from "next/navigation";

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
  const ComponentDoc = DOC_RENDERERS[slug as keyof typeof DOC_RENDERERS];

  if (!page || !ComponentDoc) {
    notFound();
  }

  return (
    <ComponentDocPage page={page}>
      <ComponentDoc page={page} />
    </ComponentDocPage>
  );
}
