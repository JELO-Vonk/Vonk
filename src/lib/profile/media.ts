import { prisma } from "@/lib/prisma/client";
import { isAllowedUpload } from "@/lib/moderation/fileValidation";

const MAX_IMAGE_BYTES = 1_500_000;

export async function fileToDataUrl(file: File) {
  if (!file.size) {
    throw new Error("Bestand is leeg.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Afbeelding is te groot. Gebruik maximaal 1,5 MB.");
  }

  if (!isAllowedUpload(file.type) || !file.type.startsWith("image/")) {
    throw new Error("Alleen JPG, PNG of WebP afbeeldingen zijn toegestaan.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${bytes.toString("base64")}`;
}

export async function saveAvatarUpload(profileId: string, file: File) {
  const dataUrl = await fileToDataUrl(file);

  return prisma.profile.update({
    where: { id: profileId },
    data: { avatarUrl: dataUrl }
  });
}

export async function addGalleryUpload(profileId: string, file: File) {
  const dataUrl = await fileToDataUrl(file);
  const last = await prisma.profileMedia.findFirst({
    where: { profileId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true }
  });

  return prisma.profileMedia.create({
    data: {
      profileId,
      type: "photo",
      storageKey: `inline:${Date.now()}`,
      originalUrl: dataUrl,
      thumbUrl: dataUrl,
      sortOrder: (last?.sortOrder ?? -1) + 1
    }
  });
}
