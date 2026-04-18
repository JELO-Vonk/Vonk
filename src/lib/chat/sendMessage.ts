import { prisma } from "@/lib/prisma/client";
import { assertRecentActionWithinLimit, recordAction } from "@/lib/moderation/rateLimit";
import { looksLikeSpam } from "@/lib/moderation/spamDetection";

export async function sendTextMessage(chatId: string, senderUserId: string, body: string) {
  const cleanBody = body.trim();
  if (!cleanBody) {
    throw new Error("Bericht mag niet leeg zijn.");
  }

  return prisma.$transaction(async (tx) => {
    const message = await tx.chatMessage.create({
      data: {
        chatId,
        senderUserId,
        type: "TEXT",
        body: cleanBody
      }
    });

    await tx.chat.update({
      where: { id: chatId },
      data: { lastMessageAt: message.createdAt }
    });

    return message;
  });
}

export async function sendChatMessage(chatId: string, senderUserId: string, body: string) {
  const cleanBody = body.trim();
  if (!cleanBody) {
    return { ok: false as const, error: "missing_message" };
  }

  try {
    await assertRecentActionWithinLimit(senderUserId, "chat_message", 8, 60);
  } catch {
    return { ok: false as const, error: "rate_limited" };
  }

  if (looksLikeSpam(cleanBody)) {
    return { ok: false as const, error: "spam_blocked" };
  }

  await sendTextMessage(chatId, senderUserId, cleanBody);
  await recordAction(senderUserId, "chat_message", { chatId });
  return { ok: true as const };
}
