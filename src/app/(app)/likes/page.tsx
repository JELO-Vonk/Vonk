import Link from "next/link";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { requireOnboardingUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { getTierDefaults } from "@/lib/billing/entitlements";

export default async function LikesPage() {
  const user = await requireOnboardingUser();
  const tier = user.subscriptions[0]?.tier ?? "FREE";
  const canSeeReceivedLikes = getTierDefaults(tier).canSeeWhoLikedYou;

  const [sentLikes, receivedLikesCount, receivedLikes] = await Promise.all([
    prisma.like.findMany({
      where: { fromUserId: user.id },
      include: { toUser: { include: { profile: true } } },
      orderBy: { createdAt: "desc" }
    }),
    prisma.like.count({ where: { toUserId: user.id } }),
    canSeeReceivedLikes
      ? prisma.like.findMany({
          where: { toUserId: user.id },
          include: { fromUser: { include: { profile: true } } },
          orderBy: { createdAt: "desc" }
        })
      : Promise.resolve([])
  ]);

  return (
    <div className="grid grid-2">
      <div className="surface stack">
        <SectionTitle title="Ontvangen likes" description="Wie jou al leuk vond." />
        {!canSeeReceivedLikes ? (
          <div className="card stack">
            <strong>{receivedLikesCount} likes ontvangen</strong>
            <p className="muted" style={{ margin: 0 }}>Deze lijst is een Gold/Platinum-functie. Upgrade om te zien wie jou heeft geliket.</p>
            <Link href="/premium" className="btn btn-primary">Upgrade</Link>
          </div>
        ) : (
          <div className="list">
            {receivedLikes.length ? receivedLikes.map((like) => (
              <div key={like.id} className="card stack">
                <strong>{like.fromUser.profile?.displayName ?? like.fromUser.email}</strong>
                <p className="muted" style={{ margin: 0 }}>{like.fromUser.profile?.city ?? "Onbekend"}</p>
                {like.fromUser.profile ? <Link href={`/discover/${like.fromUser.profile.id}`} className="btn btn-secondary">Bekijk profiel</Link> : null}
              </div>
            )) : <p className="muted" style={{ margin: 0 }}>Nog geen likes ontvangen.</p>}
          </div>
        )}
      </div>
      <div className="surface stack">
        <SectionTitle title="Verstuurde likes" description="Jouw uitgaande interesse." />
        <div className="list">
          {sentLikes.length ? sentLikes.map((like) => (
            <div key={like.id} className="card stack">
              <strong>{like.toUser.profile?.displayName ?? like.toUser.email}</strong>
              <p className="muted" style={{ margin: 0 }}>{like.toUser.profile?.city ?? "Onbekend"}</p>
              {like.toUser.profile ? <Link href={`/discover/${like.toUser.profile.id}`} className="btn btn-secondary">Bekijk profiel</Link> : null}
            </div>
          )) : <p className="muted" style={{ margin: 0 }}>Je hebt nog niemand geliket.</p>}
        </div>
      </div>
    </div>
  );
}
