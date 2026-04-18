import { NextResponse } from "next/server";
import { requireOnboardingUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { assertRecentActionWithinLimit, recordAction } from "@/lib/moderation/rateLimit";

const allowedReasons = new Set([
  "SPAM",
  "FAKE_PROFILE",
  "UNDERAGE",
  "HARASSMENT",
  "NUDITY",
  "SCAM",
  "HATEFUL_BEHAVIOR",
  "OFF_PLATFORM_SOLICITATION",
  "OTHER"
]);

export async function GET() {
  const user = await requireOnboardingUser();
  const reports = await prisma.report.findMany({
    where: { reporterUserId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return NextResponse.json({ ok: true, reports });
}

export async function POST(request: Request) {
  const user = await requireOnboardingUser();
  const formData = await request.formData();
  const reportedUserId = String(formData.get("reportedUserId") ?? "").trim() || null;
  const reportedProfileId = String(formData.get("reportedProfileId") ?? "").trim() || null;
  const reportedMessageId = String(formData.get("reportedMessageId") ?? "").trim() || null;
  const reportedVideoCallId = String(formData.get("reportedVideoCallId") ?? "").trim() || null;
  const contextType = String(formData.get("contextType") ?? "USER").trim();
  const reasonCode = String(formData.get("reasonCode") ?? "OTHER").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const returnTo = String(formData.get("returnTo") ?? "/reports").trim() || "/reports";

  if (!allowedReasons.has(reasonCode)) {
    return NextResponse.redirect(new URL(`${returnTo}?error=invalid_reason`, request.url));
  }

  try {
    await assertRecentActionWithinLimit(user.id, "report_submit", 5, 300);
  } catch {
    return NextResponse.redirect(new URL(`${returnTo}?error=rate_limited`, request.url));
  }

  await prisma.report.create({
    data: {
      reporterUserId: user.id,
      reportedUserId,
      reportedProfileId,
      reportedMessageId,
      reportedVideoCallId,
      contextType: contextType as never,
      reasonCode: reasonCode as never,
      notes
    }
  });

  await recordAction(user.id, "report_submit", { contextType, reportedUserId, reportedProfileId, reportedMessageId, reportedVideoCallId });
  return NextResponse.redirect(new URL(`${returnTo}?sent=1`, request.url));
}
