import { loadRegistry } from "shadcn/registry";

export const dynamic = "force-static";
export const runtime = "nodejs";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
} as const;

export async function GET() {
  try {
    const registry = await loadRegistry();

    return Response.json(registry, { headers: CACHE_HEADERS });
  } catch (error) {
    console.error("Failed to load the registry catalog.", error);

    return Response.json({ error: "Failed to load the registry catalog." }, { status: 500 });
  }
}
