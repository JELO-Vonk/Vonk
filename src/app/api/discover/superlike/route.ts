import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, route: "discover/superlike" });
}

export async function POST() {
  return NextResponse.json({ ok: true, route: "discover/superlike" });
}
