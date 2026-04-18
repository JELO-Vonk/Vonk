import {
  PrismaClient,
  UserRole,
  UserStatus,
  Gender,
  InterestedIn,
  ProfileVisibility,
  VerificationStatus,
  SubscriptionTier,
  SubscriptionStatus,
  PaymentProvider
} from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

const demoProfiles = [
  {
    email: "demo@vonk.local",
    displayName: "Sanne",
    city: "Groningen",
    bio: "Houdt van live muziek, spontaan uit eten en lange wandelingen.",
    gender: Gender.WOMAN,
    interestedIn: InterestedIn.MEN,
    tier: SubscriptionTier.PLATINUM
  },
  {
    email: "milan@vonk.local",
    displayName: "Milan",
    city: "Utrecht",
    bio: "Sportief, ondernemend en altijd in voor een goed gesprek.",
    gender: Gender.MAN,
    interestedIn: InterestedIn.WOMEN,
    tier: SubscriptionTier.GOLD
  },
  {
    email: "noor@vonk.local",
    displayName: "Noor",
    city: "Amsterdam",
    bio: "Koffie, citytrips en een zwak voor humor.",
    gender: Gender.WOMAN,
    interestedIn: InterestedIn.MEN,
    tier: SubscriptionTier.FREE
  },
  {
    email: "daan@vonk.local",
    displayName: "Daan",
    city: "Rotterdam",
    bio: "Liefhebber van koken, festivals en weekendjes weg.",
    gender: Gender.MAN,
    interestedIn: InterestedIn.WOMEN,
    tier: SubscriptionTier.FREE
  },
  {
    email: "zoe@vonk.local",
    displayName: "Zoë",
    city: "Leeuwarden",
    bio: "Creatief, rustig en dol op terrassen en reizen.",
    gender: Gender.WOMAN,
    interestedIn: InterestedIn.MEN,
    tier: SubscriptionTier.GOLD
  },
  {
    email: "ruben@vonk.local",
    displayName: "Ruben",
    city: "Eindhoven",
    bio: "Tech, humor en spontane roadtrips.",
    gender: Gender.MAN,
    interestedIn: InterestedIn.WOMEN,
    tier: SubscriptionTier.FREE
  }
];

async function upsertDemoUser(email: string, passwordHash: string) {
  return prisma.user.upsert({
    where: { email },
    update: { passwordHash, status: UserStatus.ACTIVE, emailVerifiedAt: new Date() },
    create: {
      email,
      passwordHash,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      preferences: {
        create: {
          minAge: 24,
          maxAge: 40,
          maxDistanceKm: 80,
          allowMen: true,
          allowWomen: true,
          allowNonBinary: true
        }
      }
    }
  });
}

async function main() {
  const passwordHash = await hashPassword("ChangeMe123!");

  await prisma.user.upsert({
    where: { email: "admin@vonk.local" },
    update: { passwordHash, role: UserRole.ADMIN, status: UserStatus.ACTIVE, emailVerifiedAt: new Date() },
    create: {
      email: "admin@vonk.local",
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          displayName: "Vonk Admin",
          birthDate: new Date("1990-01-01"),
          gender: Gender.OTHER,
          interestedIn: InterestedIn.EVERYONE,
          bio: "Beheeraccount voor Vonk.",
          city: "Amsterdam",
          country: "NL",
          visibility: ProfileVisibility.HIDDEN,
          verificationStatus: VerificationStatus.VERIFIED,
          onboardingCompleted: true,
          completionScore: 100
        }
      }
    }
  });

  for (const [index, profile] of demoProfiles.entries()) {
    const user = await upsertDemoUser(profile.email, passwordHash);

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        displayName: profile.displayName,
        birthDate: new Date(`199${index + 2}-0${(index % 8) + 1}-1${index}`),
        gender: profile.gender,
        interestedIn: profile.interestedIn,
        bio: profile.bio,
        city: profile.city,
        country: "NL",
        visibility: ProfileVisibility.PUBLIC,
        verificationStatus: VerificationStatus.VERIFIED,
        onboardingCompleted: true,
        completionScore: 88 - index * 4
      },
      create: {
        userId: user.id,
        displayName: profile.displayName,
        birthDate: new Date(`199${index + 2}-0${(index % 8) + 1}-1${index}`),
        gender: profile.gender,
        interestedIn: profile.interestedIn,
        bio: profile.bio,
        city: profile.city,
        country: "NL",
        visibility: ProfileVisibility.PUBLIC,
        verificationStatus: VerificationStatus.VERIFIED,
        onboardingCompleted: true,
        completionScore: 88 - index * 4
      }
    });

    await prisma.subscription.upsert({
      where: {
        providerSubscriptionId: `seed-${profile.email}`
      },
      update: {
        tier: profile.tier,
        status: profile.tier === SubscriptionTier.FREE ? SubscriptionStatus.INACTIVE : SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      },
      create: {
        userId: user.id,
        provider: PaymentProvider.MOLLIE,
        providerSubscriptionId: `seed-${profile.email}`,
        tier: profile.tier,
        status: profile.tier === SubscriptionTier.FREE ? SubscriptionStatus.INACTIVE : SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      }
    });
  }

  const demo = await prisma.user.findUniqueOrThrow({ where: { email: "demo@vonk.local" } });
  const milan = await prisma.user.findUniqueOrThrow({ where: { email: "milan@vonk.local" } });
  const noor = await prisma.user.findUniqueOrThrow({ where: { email: "noor@vonk.local" } });
  const daan = await prisma.user.findUniqueOrThrow({ where: { email: "daan@vonk.local" } });

  await prisma.like.upsert({
    where: { fromUserId_toUserId: { fromUserId: milan.id, toUserId: demo.id } },
    update: {},
    create: { fromUserId: milan.id, toUserId: demo.id, source: "GALLERY" }
  });

  await prisma.like.upsert({
    where: { fromUserId_toUserId: { fromUserId: demo.id, toUserId: noor.id } },
    update: {},
    create: { fromUserId: demo.id, toUserId: noor.id, source: "GALLERY" }
  });


  await prisma.like.upsert({
    where: { fromUserId_toUserId: { fromUserId: demo.id, toUserId: milan.id } },
    update: {},
    create: { fromUserId: demo.id, toUserId: milan.id, source: "GALLERY" }
  });

  const existingMatch = await prisma.match.findFirst({
    where: {
      OR: [
        { userAId: demo.id, userBId: milan.id },
        { userAId: milan.id, userBId: demo.id }
      ]
    }
  });

  const match = existingMatch ?? await prisma.match.create({
    data: {
      userAId: demo.id < milan.id ? demo.id : milan.id,
      userBId: demo.id < milan.id ? milan.id : demo.id,
      source: "GALLERY",
      chat: { create: {} }
    },
    include: { chat: true }
  });

  const chatId = (match as any).chat?.id ?? (await prisma.chat.findFirstOrThrow({ where: { matchId: match.id } })).id;



  const demoProfile = await prisma.profile.findUniqueOrThrow({ where: { userId: demo.id } });
  const milanProfile = await prisma.profile.findUniqueOrThrow({ where: { userId: milan.id } });

  await prisma.profileMedia.upsert({
    where: { id: `seed-media-${demoProfile.id}` },
    update: { originalUrl: "https://cdn.vonk.local/demo-sanne.jpg", storageKey: "https://cdn.vonk.local/demo-sanne.jpg", thumbUrl: "https://cdn.vonk.local/demo-sanne-thumb.jpg" },
    create: { id: `seed-media-${demoProfile.id}`, profileId: demoProfile.id, type: "photo", originalUrl: "https://cdn.vonk.local/demo-sanne.jpg", storageKey: "https://cdn.vonk.local/demo-sanne.jpg", thumbUrl: "https://cdn.vonk.local/demo-sanne-thumb.jpg", sortOrder: 0 }
  });

  await prisma.profileMedia.upsert({
    where: { id: `seed-media-${milanProfile.id}` },
    update: { originalUrl: "https://cdn.vonk.local/demo-milan.jpg", storageKey: "https://cdn.vonk.local/demo-milan.jpg", thumbUrl: "https://cdn.vonk.local/demo-milan-thumb.jpg" },
    create: { id: `seed-media-${milanProfile.id}`, profileId: milanProfile.id, type: "photo", originalUrl: "https://cdn.vonk.local/demo-milan.jpg", storageKey: "https://cdn.vonk.local/demo-milan.jpg", thumbUrl: "https://cdn.vonk.local/demo-milan-thumb.jpg", sortOrder: 0 }
  });

  await prisma.profileView.deleteMany({ where: { source: "seed" } });

  await prisma.profileView.createMany({
    data: [
      { viewerUserId: milan.id, viewedProfileId: demoProfile.id, source: "seed" },
      { viewerUserId: noor.id, viewedProfileId: demoProfile.id, source: "seed" },
      { viewerUserId: demo.id, viewedProfileId: milanProfile.id, source: "seed" }
    ],
    skipDuplicates: true
  });

  await prisma.block.upsert({
    where: { blockerUserId_blockedUserId: { blockerUserId: daan.id, blockedUserId: noor.id } },
    update: {},
    create: { blockerUserId: daan.id, blockedUserId: noor.id }
  });

  const existingMessages = await prisma.chatMessage.count({ where: { chatId } });
  if (existingMessages === 0) {
    await prisma.chatMessage.createMany({
      data: [
        { chatId, senderUserId: demo.id, type: "TEXT", body: "Hey Milan, gezellig dat we gematcht zijn!" },
        { chatId, senderUserId: milan.id, type: "TEXT", body: "Leuk! Zin om binnenkort iets te drinken?" }
      ]
    });
    await prisma.chat.update({ where: { id: chatId }, data: { lastMessageAt: new Date() } });
  }

  await seedNotifications();

  console.log("Seed voltooid.");
  console.log("Admin: admin@vonk.local / ChangeMe123!");
  console.log("Demo: demo@vonk.local / ChangeMe123!");
  console.log("Extra: milan@vonk.local / ChangeMe123!, noor@vonk.local / ChangeMe123!, daan@vonk.local / ChangeMe123!, zoe@vonk.local / ChangeMe123!, ruben@vonk.local / ChangeMe123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


async function seedNotifications() {
  const users = await prisma.user.findMany({ take: 3, orderBy: { createdAt: "asc" } });
  for (const user of users) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "SYSTEM",
        title: "Welkom bij Vonk",
        body: "Je meldingen verschijnen hier zodra je matches of berichten ontvangt.",
        href: "/notifications"
      }
    });
  }
}
