import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionForUser } from "@/lib/auth/session";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return NextResponse.redirect(new URL("/login?error=missing", request.url));
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url));
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url));
  }

  await createSessionForUser(user.id);
  const destination = user.status === "BANNED" ? "/login?error=banned" : "/dashboard";
  return NextResponse.redirect(new URL(destination, request.url));
}
