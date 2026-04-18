import { NextResponse } from "next/server";
import { requireOnboardingUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

function parseNumber(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function POST(request: Request) {
  const user = await requireOnboardingUser();
  const formData = await request.formData();

  const minAge = Math.max(18, parseNumber(formData.get("minAge"), 18));
  const maxAge = Math.max(minAge, parseNumber(formData.get("maxAge"), 50));
  const maxDistanceKm = Math.max(1, parseNumber(formData.get("maxDistanceKm"), 100));

  await prisma.userPreference.upsert({
    where: { userId: user.id },
    update: {
      minAge,
      maxAge,
      maxDistanceKm,
      showVerifiedOnly: formData.get("showVerifiedOnly") === "on",
      showOnlineOnly: formData.get("showOnlineOnly") === "on",
      allowMen: formData.get("allowMen") === "on",
      allowWomen: formData.get("allowWomen") === "on",
      allowNonBinary: formData.get("allowNonBinary") === "on"
    },
    create: {
      userId: user.id,
      minAge,
      maxAge,
      maxDistanceKm,
      showVerifiedOnly: formData.get("showVerifiedOnly") === "on",
      showOnlineOnly: formData.get("showOnlineOnly") === "on",
      allowMen: formData.get("allowMen") === "on",
      allowWomen: formData.get("allowWomen") === "on",
      allowNonBinary: formData.get("allowNonBinary") === "on"
    }
  });

  return NextResponse.redirect(new URL("/settings/preferences?saved=1", request.url));
}
