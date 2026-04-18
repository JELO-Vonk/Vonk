import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, route: "billing/subscription" });
}

export async function POST() {
  return NextResponse.json({ ok: true, route: "billing/subscription" });
}
