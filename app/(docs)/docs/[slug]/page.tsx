import { StructuredDocPage } from "@/components/docs/content/structured-doc-page";
import { DOCS_PAGES, getDocsPage } from "@/lib/docs-content";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return DOCS_PAGES.map((page) => ({
    slug: page.slug,
  }));
}

export default async function DocsStructuredPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getDocsPage(slug);

  if (!page) {
    notFound();
  }

  return <StructuredDocPage page={page} />;
}

