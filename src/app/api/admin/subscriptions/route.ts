import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, route: "admin/subscriptions" });
}

export async function POST() {
  return NextResponse.json({ ok: true, route: "admin/subscriptions" });
}
