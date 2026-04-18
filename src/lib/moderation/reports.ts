import { prisma } from "@/lib/prisma/client";

export async function createUserReport(input: {
  reporterUserId: string;
  reportedUserId?: string;
  reportedMessageId?: string;
  reportedVideoCallId?: string;
  reportedProfileId?: string;
  contextType: "PROFILE" | "CHAT" | "MESSAGE" | "VIDEO" | "USER";
  reasonCode: "SPAM" | "FAKE_PROFILE" | "UNDERAGE" | "HARASSMENT" | "NUDITY" | "SCAM" | "HATEFUL_BEHAVIOR" | "OFF_PLATFORM_SOLICITATION" | "OTHER";
  notes?: string;
}) {
  return prisma.report.create({ data: input });
}
