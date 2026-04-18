import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { requireOnboardingUser } from "@/lib/auth/guards";
import { getDiscoverableProfileForViewer, getProfileAge } from "@/lib/discover/profiles";
import { getOrCreateDailyUsage } from "@/lib/usage/dailyUsage";
import { getDailyProfileViewLimit } from "@/lib/usage/limits";
import { prisma } from "@/lib/prisma/client";
import { assertRecentActionWithinLimit, recordAction } from "@/lib/moderation/rateLimit";

export default async function DiscoverProfilePage({ params, searchParams }: { params: Promise<{ profileId: string }>; searchParams: Promise<{ error?: string; sent?: string }> }) {
  const [{ profileId }, { error, sent }, user] = await Promise.all([params, searchParams, requireOnboardingUser()]);
  const profile = await getDiscoverableProfileForViewer(profileId, user.id);
  if (!profile) notFound();

  const tier = user.subscriptions[0]?.tier ?? "FREE";
  const usage = await getOrCreateDailyUsage(user.id);
  const limit = getDailyProfileViewLimit(tier);
  const remaining = Number.isFinite(limit) ? Math.max(0, limit - usage.profileViewsUsed) : null;

  const existingView = await prisma.profileView.findFirst({
    where: {
      viewerUserId: user.id,
      viewedProfileId: profile.id
    },
    select: { id: true }
  });

  if (!existingView) {
    if (Number.isFinite(limit) && usage.profileViewsUsed >= limit) {
      return (
        <div className="surface stack">
          <SectionTitle title="Daglimiet bereikt" description="Je hebt vandaag geen profielweergaven meer over." />
          <p className="muted" style={{ margin: 0 }}>Upgrade naar Gold of Platinum om meer profielen te bekijken.</p>
          <div className="row">
            <Link href="/premium" className="btn btn-primary">Bekijk premium</Link>
            <Link href="/discover" className="btn btn-secondary">Terug naar ontdekken</Link>
          </div>
        </div>
      );
    }

    try {
      await assertRecentActionWithinLimit(user.id, "discover_profile_view", 20, 60);
      await prisma.$transaction([
        prisma.profileView.create({
          data: {
            viewerUserId: user.id,
            viewedProfileId: profile.id,
            source: "detail"
          }
        }),
        prisma.dailyUsage.update({
          where: {
            userId_dateKey: {
              userId: user.id,
              dateKey: new Date().toISOString().slice(0, 10)
            }
          },
          data: {
            profileViewsUsed: { increment: 1 }
          }
        })
      ]);
      await recordAction(user.id, "discover_profile_view", { profileId });
    } catch {
      // keep page usable; rate limit only avoids counting storms
    }
  }

  const alreadyLiked = await prisma.like.findUnique({
    where: {
      fromUserId_toUserId: {
        fromUserId: user.id,
        toUserId: profile.userId
      }
    },
    select: { id: true }
  });

  return (
    <div className="stack">
      <div className="surface stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <SectionTitle title={profile.displayName} description={`${getProfileAge(profile.birthDate)} jaar • ${profile.city ?? "Onbekend"}`} />
          <div className="row muted">
            <span>{profile.verificationStatus === "VERIFIED" ? "Geverifieerd" : "Niet geverifieerd"}</span>
            {profile.spotlights.length ? <span className="badge">Spotlight</span> : null}
          </div>
        </div>
        {error === "rate_limited" ? <div className="alert alert-danger">Je gaat te snel. Wacht even en probeer opnieuw.</div> : null}
        {sent ? <div className="alert alert-success">Je melding is opgeslagen.</div> : null}
        <div className="profile-cover profile-cover-large">
          <div className="profile-avatar profile-avatar-large">{profile.displayName.slice(0, 1).toUpperCase()}</div>
        </div>
        {profile.media.length ? (
          <div className="list">
            {profile.media.map((item) => (
              <div key={item.id} className="card stack">
                <strong>{item.type === "video" ? "Video" : "Foto"}</strong>
                <div className="muted" style={{ wordBreak: "break-all" }}>{item.originalUrl ?? item.storageKey}</div>
              </div>
            ))}
          </div>
        ) : null}
        <p style={{ margin: 0 }}>{profile.bio ?? "Nog geen bio ingevuld."}</p>
        <div className="row muted">
          <span>{profile.country ?? "NL"}</span>
          <span>•</span>
          <span>Profielscore {profile.completionScore}</span>
          <span>•</span>
          <span>{remaining === null ? "Onbeperkt bekijken" : `Nog ${remaining} profielen vandaag`}</span>
        </div>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <Link href="/discover" className="btn btn-secondary">Terug</Link>
          <form action="/api/discover/pass" method="post">
            <input type="hidden" name="profileId" value={profile.id} />
            <button className="btn btn-secondary" type="submit">Skip</button>
          </form>
          {!alreadyLiked ? (
            <form action="/api/discover/like" method="post">
              <input type="hidden" name="profileId" value={profile.id} />
              <button className="btn btn-primary" type="submit">Like</button>
            </form>
          ) : (
            <span className="badge">Al geliket</span>
          )}
          <form action="/api/blocks" method="post">
            <input type="hidden" name="blockedUserId" value={profile.userId} />
            <button className="btn btn-secondary" type="submit">Blokkeer</button>
          </form>
        </div>
        <form action="/api/reports" method="post" className="card stack">
          <strong>Meld dit profiel</strong>
          <input type="hidden" name="reportedUserId" value={profile.userId} />
          <input type="hidden" name="reportedProfileId" value={profile.id} />
          <input type="hidden" name="contextType" value="PROFILE" />
          <input type="hidden" name="returnTo" value={`/discover/${profile.id}`} />
          <select name="reasonCode" className="input" defaultValue="OTHER">
            <option value="FAKE_PROFILE">Fake profiel</option>
            <option value="SPAM">Spam</option>
            <option value="HARASSMENT">Lastig gedrag</option>
            <option value="NUDITY">Ongepaste content</option>
            <option value="SCAM">Scam</option>
            <option value="OTHER">Overig</option>
          </select>
          <textarea className="textarea" name="notes" rows={3} placeholder="Korte toelichting (optioneel)" />
          <button className="btn btn-secondary" type="submit">Melding versturen</button>
        </form>
      </div>
    </div>
  );
}
