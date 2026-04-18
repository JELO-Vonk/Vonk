import { NextResponse } from "next/server";
import { requireOnboardingUser } from "@/lib/auth/guards";
import { getUserChats } from "@/lib/chat/getChat";
import { sendTextMessage } from "@/lib/chat/sendMessage";
import { prisma } from "@/lib/prisma/client";
import { assertRecentActionWithinLimit, recordAction } from "@/lib/moderation/rateLimit";
import { looksLikeSpam } from "@/lib/moderation/spamDetection";

export async function GET() {
  const user = await requireOnboardingUser();
  const chats = await getUserChats(user.id);
  return NextResponse.json({ ok: true, chats });
}

export async function POST(request: Request) {
  const user = await requireOnboardingUser();
  const formData = await request.formData();
  const chatId = String(formData.get("chatId") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!chatId || !body) {
    return NextResponse.redirect(new URL("/chats?error=missing_message", request.url));
  }

  if (looksLikeSpam(body)) {
    return NextResponse.redirect(new URL("/chats?error=spam_blocked", request.url));
  }

  try {
    await assertRecentActionWithinLimit(user.id, "chat_message", 8, 20);
  } catch {
    return NextResponse.redirect(new URL("/chats?error=rate_limited", request.url));
  }

  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      match: {
        OR: [{ userAId: user.id }, { userBId: user.id }]
      }
    }
  });

  if (!chat) {
    return NextResponse.redirect(new URL("/chats?error=forbidden", request.url));
  }

  await sendTextMessage(chat.id, user.id, body);
  await recordAction(user.id, "chat_message", { chatId, length: body.length });
  return NextResponse.redirect(new URL(`/chats/${chat.id}?sent=1`, request.url));
}
