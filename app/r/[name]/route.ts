import { loadRegistryItem, RegistryItemNotFoundError } from "shadcn/registry";

import registry from "@/registry.json";

export const dynamic = "force-static";
export const dynamicParams = false;
export const runtime = "nodejs";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
} as const;

type RegistryItemRouteContext = {
  params: Promise<{
    name: string;
  }>;
};

export function generateStaticParams() {
  return registry.items.map(({ name }) => ({
    name: `${name}.json`,
  }));
}

export async function GET(_request: Request, context: RegistryItemRouteContext) {
  const { name: pathName } = await context.params;

  if (!pathName.endsWith(".json")) {
    return Response.json({ error: "Registry item paths must end in .json." }, { status: 404 });
  }

  const name = pathName.slice(0, -".json".length);

  try {
    const item = await loadRegistryItem(name);

    return Response.json(item, { headers: CACHE_HEADERS });
  } catch (error) {
    if (error instanceof RegistryItemNotFoundError) {
      return Response.json({ error: `Registry item "${name}" was not found.` }, { status: 404 });
    }

    console.error(`Failed to load registry item "${name}".`, error);

    return Response.json({ error: "Failed to load the registry item." }, { status: 500 });
  }
}
