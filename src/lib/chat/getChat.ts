import { prisma } from "@/lib/prisma/client";

export async function getUserChats(userId: string) {
  return prisma.chat.findMany({
    where: {
      match: {
        OR: [{ userAId: userId }, { userBId: userId }]
      }
    },
    include: {
      match: {
        include: {
          userA: {
            include: { profile: true }
          },
          userB: {
            include: { profile: true }
          }
        }
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    },
    orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }]
  });
}


export async function getChatById(chatId: string, userId: string) {
  return prisma.chat.findFirst({
    where: {
      id: chatId,
      match: {
        OR: [{ userAId: userId }, { userBId: userId }]
      }
    },
    include: {
      match: {
        include: {
          userA: { include: { profile: true } },
          userB: { include: { profile: true } }
        }
      },
      messages: {
        orderBy: { createdAt: "asc" },
        take: 100
      }
    }
  });
}
