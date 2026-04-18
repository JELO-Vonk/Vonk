import { prisma } from "@/lib/prisma/client";
import { assertRecentActionWithinLimit, recordAction } from "@/lib/moderation/rateLimit";
import { looksLikeSpam } from "@/lib/moderation/spamDetection";
import { createNotificationTx } from "@/lib/notifications";

export async function sendTextMessage(chatId: string, senderUserId: string, body: string) {
  const cleanBody = body.trim();
  if (!cleanBody) {
    throw new Error("Bericht mag niet leeg zijn.");
  }

  return prisma.$transaction(async (tx) => {
    const chat = await tx.chat.findUnique({ where: { id: chatId }, include: { match: true } });
    if (!chat) throw new Error("Chat niet gevonden.");

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

    const recipientUserId = chat.match.userAId === senderUserId ? chat.match.userBId : chat.match.userAId;
    await createNotificationTx(tx, recipientUserId, "MESSAGE_RECEIVED", "Nieuw bericht", cleanBody.slice(0, 120), `/chats/${chatId}`, { chatId, senderUserId });

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
