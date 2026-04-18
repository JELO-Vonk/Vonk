import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { hashPassword } from "@/lib/auth/password";
import { createSessionForUser } from "@/lib/auth/session";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return NextResponse.redirect(new URL("/register?error=missing", request.url));
  }

  if (password.length < 8) {
    return NextResponse.redirect(new URL("/register?error=weak_password", request.url));
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.redirect(new URL("/register?error=exists", request.url));
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      preferences: {
        create: {}
      }
    }
  });

  await createSessionForUser(user.id);
  return NextResponse.redirect(new URL("/onboarding", request.url));
}
