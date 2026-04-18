import Link from "next/link";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { requireOnboardingUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

export default async function MatchesPage() {
  const user = await requireOnboardingUser();
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ userAId: user.id }, { userBId: user.id }]
    },
    include: {
      userA: { include: { profile: true } },
      userB: { include: { profile: true } },
      chat: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="surface stack">
      <SectionTitle title="Matches" description="Wederzijdse likes maken nu direct een chat aan en linken naar het juiste gesprek." />
      <div className="list">
        {matches.length ? matches.map((match) => {
          const counterpart = match.userAId === user.id ? match.userB : match.userA;
          return (
            <div key={match.id} className="card stack">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <strong>{counterpart.profile?.displayName ?? counterpart.email}</strong>
                  <p className="muted" style={{ margin: "6px 0 0" }}>{counterpart.profile?.city ?? "Onbekend"}</p>
                </div>
                <span className="badge">Nieuwe match</span>
              </div>
              <div className="row">
                {counterpart.profile ? <Link href={`/discover/${counterpart.profile.id}`} className="btn btn-secondary">Bekijk profiel</Link> : null}
                {match.chat ? <Link href={`/chats/${match.chat.id}`} className="btn btn-primary">Open chat</Link> : <span className="muted">Geen chat</span>}
              </div>
            </div>
          );
        }) : <p className="muted" style={{ margin: 0 }}>Nog geen matches.</p>}
      </div>
    </div>
  );
}
