import { NextResponse } from "next/server";

const VIDEO_BASE_URL = "https://assets.skecher-ui.com/skecher-components/edit-video-projects";
const MAX_VIDEO_INDEX = 14;
const ONE_YEAR = 60 * 60 * 24 * 365;

export const revalidate = 31_536_000;

export async function GET(_request: Request, { params }: { params: Promise<{ index: string }> }) {
  const { index } = await params;
  const parsedIndex = Number.parseInt(index, 10);

  if (
    !Number.isInteger(parsedIndex) ||
    parsedIndex < 1 ||
    parsedIndex > MAX_VIDEO_INDEX ||
    String(parsedIndex) !== index
  ) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  const upstream = await fetch(`${VIDEO_BASE_URL}/skecher${parsedIndex}.mp4`, {
    cache: "no-store",
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Video unavailable" }, { status: 502 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Cache-Control": `public, max-age=${ONE_YEAR}, s-maxage=${ONE_YEAR}, immutable`,
      "Content-Type": upstream.headers.get("content-type") ?? "video/mp4",
      ETag: upstream.headers.get("etag") ?? `"skecher-${parsedIndex}-2026-07"`,
    },
  });
}
