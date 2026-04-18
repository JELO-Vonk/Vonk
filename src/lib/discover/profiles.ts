import { prisma } from "@/lib/prisma/client";

export async function getDiscoverableProfileForViewer(profileId: string, viewerUserId: string) {
  const blocks = await prisma.block.findMany({
    where: {
      OR: [
        { blockerUserId: viewerUserId },
        { blockedUserId: viewerUserId }
      ]
    },
    select: { blockerUserId: true, blockedUserId: true }
  });

  const blockedIds = new Set<string>();
  for (const row of blocks) {
    blockedIds.add(row.blockerUserId === viewerUserId ? row.blockedUserId : row.blockerUserId);
  }

  return prisma.profile.findFirst({
    where: {
      id: profileId,
      userId: {
        not: viewerUserId,
        notIn: [...blockedIds]
      },
      isVisible: true,
      isDiscoverable: true,
      visibility: { not: "HIDDEN" }
    },
    include: {
      user: {
        select: {
          id: true,
          lastSeenAt: true,
          createdAt: true
        }
      },
      media: {
        orderBy: { sortOrder: "asc" }
      },
      spotlights: {
        where: { endsAt: { gt: new Date() } },
        orderBy: { endsAt: "desc" },
        take: 1
      }
    }
  });
}

export function getProfileAge(birthDate: Date) {
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
