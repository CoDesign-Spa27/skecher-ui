import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ComponentDocPage } from "@/components/docs/content/component-doc-page";
import { DOC_RENDERERS } from "@/components/docs/content/generated-doc-renderers";
import { COMPONENT_DOCS, getComponentDoc } from "@/lib/docs-content";
import { absoluteUrl, createMetadata, siteConfig } from "@/lib/seo";

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

  if (!page) {
    return createMetadata({
      title: "Component Not Found",
      description: "This Skecher UI component could not be found.",
      path: `/docs/${slug}`,
      noIndex: true,
    });
  }

  return createMetadata({
    title: `${page.title} React Component`,
    description: `${page.description} Install it with the shadcn CLI and copy the source into your React app.`,
    path: `/docs/${page.slug}`,
    keywords: [
      page.title,
      `${page.title} React component`,
      `${page.title} shadcn`,
      ...page.dependencies,
    ],
  });
}

export default async function ComponentDocsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getComponentDoc(slug);
  const ComponentDoc = DOC_RENDERERS[slug as keyof typeof DOC_RENDERERS];

  if (!page || !ComponentDoc) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: `${page.title} React component`,
    url: absoluteUrl(`/docs/${page.slug}`),
    codeRepository: siteConfig.githubUrl,
    programmingLanguage: ["TypeScript", "TSX"],
    runtimePlatform: "React",
    description: page.description,
    applicationCategory: "DeveloperApplication",
    installUrl: page.cliCommand,
    softwareRequirements: page.dependencies,
  };

  return (
    <ComponentDocPage>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ComponentDoc page={page} />
    </ComponentDocPage>
  );
}
