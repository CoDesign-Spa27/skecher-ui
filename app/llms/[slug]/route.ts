import { COMPONENT_DOCS, getComponentDoc } from "@/lib/docs-content";
import { formatComponentLlmContext } from "@/lib/llm-content";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return COMPONENT_DOCS.map((component) => ({ slug: component.slug }));
}

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const component = getComponentDoc(slug);

  if (!component) {
    return new Response("Component not found.", { status: 404 });
  }

  return new Response(formatComponentLlmContext(component), {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
