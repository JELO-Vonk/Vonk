import { NextResponse } from "next/server";
import { getDiscoveryFeed } from "@/lib/discover/feed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const payload = await getDiscoveryFeed(12, {
    city: searchParams.get("city") ?? undefined,
    verifiedOnly: searchParams.get("verified") === "1"
  });

  return NextResponse.json({
    ok: true,
    feed: payload.feed,
    remaining: payload.remaining,
    tier: payload.tier
  });
}
