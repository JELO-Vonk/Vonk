import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { getLiveStatusForUser } from "@/lib/live/queue";

export async function GET() {
  const user = await requireUser();
  const status = await getLiveStatusForUser(user.id);
  return NextResponse.json({ ok: true, status });
}
