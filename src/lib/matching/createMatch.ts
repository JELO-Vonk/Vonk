import { MatchSource, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";
import { sortMatchPair } from "@/lib/matching/sortMatchPair";

export async function createMatchForUsers(
  tx: Prisma.TransactionClient,
  leftUserId: string,
  rightUserId: string,
  source: MatchSource = "GALLERY"
) {
  const [userAId, userBId] = sortMatchPair(leftUserId, rightUserId);

  const match = await tx.match.upsert({
    where: {
      userAId_userBId: {
        userAId,
        userBId
      }
    },
    update: {},
    create: {
      userAId,
      userBId,
      source
    }
  });

  await tx.chat.upsert({
    where: { matchId: match.id },
    update: {},
    create: { matchId: match.id }
  });

  return match;
}

export async function getOrCreateMatchForUsers(leftUserId: string, rightUserId: string, source: MatchSource = "GALLERY") {
  return prisma.$transaction((tx) => createMatchForUsers(tx, leftUserId, rightUserId, source));
}
