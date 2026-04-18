import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";
import { clearSessionCookie } from "@/lib/auth/session";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "vonk_session";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { refreshToken: token } });
  }

  await clearSessionCookie();
  return NextResponse.redirect(new URL("/login", request.url));
}
