import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { markNotificationsRead } from "@/lib/notifications";

export async function POST() {
  const user = await requireUser();
  await markNotificationsRead(user.id);
  return NextResponse.redirect(new URL("/notifications", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
}
