import Link from "next/link";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { requireOnboardingUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

export default async function VisitorsPage() {
  const user = await requireOnboardingUser();
  const tier = user.subscriptions[0]?.tier ?? "FREE";
  const canSeeVisitors = tier === "GOLD" || tier === "PLATINUM";

  const visitors = canSeeVisitors
    ? await prisma.profileView.findMany({
        where: { viewedProfile: { userId: user.id } },
        include: {
          viewer: { include: { profile: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 50
      })
    : [];

  return (
    <div className="surface stack">
      <SectionTitle title="Bezoekers" description="Zie wie jouw profiel recent heeft bekeken." />
      {!canSeeVisitors ? (
        <div className="stack">
          <div className="alert alert-danger">Bezoekers bekijken is beschikbaar voor Gold en Platinum.</div>
          <div className="row">
            <Link href="/premium" className="btn btn-primary">Upgrade naar premium</Link>
            <Link href="/dashboard" className="btn btn-secondary">Terug naar dashboard</Link>
          </div>
        </div>
      ) : (
        <div className="list">
          {visitors.length ? visitors.map((visit) => (
            <div key={visit.id} className="card stack">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <strong>{visit.viewer.profile?.displayName ?? visit.viewer.email}</strong>
                  <p className="muted" style={{ margin: "6px 0 0" }}>{visit.viewer.profile?.city ?? "Onbekend"}</p>
                </div>
                <span className="muted">{new Date(visit.createdAt).toLocaleString("nl-NL")}</span>
              </div>
              <div className="row">
                {visit.viewer.profile ? <Link href={`/discover/${visit.viewer.profile.id}`} className="btn btn-secondary">Bekijk profiel</Link> : null}
              </div>
            </div>
          )) : <p className="muted" style={{ margin: 0 }}>Nog geen bezoekers geregistreerd.</p>}
        </div>
      )}
    </div>
  );
}
