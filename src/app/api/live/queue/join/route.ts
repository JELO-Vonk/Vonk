import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { joinVideoQueue } from "@/lib/live/queue";

export async function POST(request: Request) {
  const user = await requireUser();
  const body = await request.json().catch(() => ({}));
  const session = await joinVideoQueue(user.id, body.filters ?? null);
  return NextResponse.json({ ok: true, session });
}
