import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/with-auth";

function isAllowedImageHost(hostname: string) {
  return (
    hostname === "fal.media" ||
    hostname.endsWith(".fal.media")
  );
}

async function handleGet(req: Request) {
  const rawUrl = new URL(req.url).searchParams.get("url");

  if (!rawUrl) {
    return NextResponse.json(
      { error: "url is required" },
      { status: 400 },
    );
  }

  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    return NextResponse.json(
      { error: "invalid url" },
      { status: 400 },
    );
  }

  if (parsed.protocol !== "https:" || !isAllowedImageHost(parsed.hostname)) {
    return NextResponse.json(
      { error: "unsupported image host" },
      { status: 400 },
    );
  }

  const response = await fetch(parsed.toString());

  if (!response.ok) {
    return NextResponse.json(
      { error: `failed to fetch image (${response.status})` },
      { status: response.status },
    );
  }

  const buffer = await response.arrayBuffer();
  const contentType =
    response.headers.get("content-type") || "image/png";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}

export const GET = withAuth(async (req) => handleGet(req));
