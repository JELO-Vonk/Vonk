import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "vonk_session";
const SESSION_MS = 1000 * 60 * 60 * 24 * 14;

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { refreshToken: token },
    include: {
      user: {
        include: {
          profile: true,
          preferences: true,
          subscriptions: {
            where: { status: "ACTIVE" },
            orderBy: [{ currentPeriodEnd: "desc" }, { createdAt: "desc" }],
            take: 1
          }
        }
      }
    }
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) return null;
  return session.user;
}

export async function createSessionForUser(userId: string) {
  const expiresAt = new Date(Date.now() + SESSION_MS);
  const session = await prisma.session.create({
    data: {
      userId,
      refreshToken: crypto.randomUUID(),
      expiresAt
    }
  });

  await setSessionCookie(session.refreshToken, expiresAt);
  return session;
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/"
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/"
  });
}
