import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, route: "auth/forgot-password" });
}

export async function POST() {
  return NextResponse.json({ ok: true, route: "auth/forgot-password" });
}
