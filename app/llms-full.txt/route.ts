import { COMPONENT_DOCS } from "@/lib/docs-content";
import { formatLlmCatalog } from "@/lib/llm-content";

export const dynamic = "force-static";

export function GET() {
  return new Response(formatLlmCatalog(COMPONENT_DOCS), {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
