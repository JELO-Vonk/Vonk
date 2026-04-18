import { SectionTitle } from "@/components/ui/SectionTitle";
import { KpiCard } from "@/components/ui/KpiCard";
import { requireOnboardingUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { getOrCreateDailyUsage } from "@/lib/usage/dailyUsage";
import { getDailyProfileViewLimit } from "@/lib/usage/limits";

export default async function DashboardPage() {
  const user = await requireOnboardingUser();
  const usage = await getOrCreateDailyUsage(user.id);
  const plan = user.subscriptions[0]?.tier ?? "FREE";
  const [incomingLikes, matchCount, chats] = await Promise.all([
    prisma.like.count({ where: { toUserId: user.id } }),
    prisma.match.count({ where: { OR: [{ userAId: user.id }, { userBId: user.id }] } }),
    prisma.chat.count({ where: { match: { OR: [{ userAId: user.id }, { userBId: user.id }] } } })
  ]);
  const profileLimit = getDailyProfileViewLimit(plan);

  return (
    <>
      <div className="surface stack">
        <SectionTitle title={`Welkom terug, ${user.profile?.displayName ?? "Vonk"}`} description="Dit dashboard laat nu echte accountdata zien uit je huidige build." />
        <div className="row muted">
          <span>Plan: <strong>{plan}</strong></span>
          <span>•</span>
          <span>Profielscore: <strong>{user.profile?.completionScore ?? 0}</strong></span>
        </div>
      </div>
      <div className="grid grid-2">
        <KpiCard label="Ontvangen likes" value={String(incomingLikes)} hint="Totaal ontvangen likes" />
        <KpiCard label="Matches" value={String(matchCount)} hint="Wederzijdse likes" />
        <KpiCard label="Chats" value={String(chats)} hint="Actieve chatkanalen" />
        <KpiCard label="Vandaag bekeken" value={String(usage.profileViewsUsed)} hint={Number.isFinite(profileLimit) ? `Van ${profileLimit} profielen vandaag` : "Onbeperkt vandaag"} />
      </div>
    </>
  );
}
