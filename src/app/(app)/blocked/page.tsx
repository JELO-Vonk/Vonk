import Link from "next/link";
import { requireOnboardingUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { SectionTitle } from "@/components/ui/SectionTitle";

export default async function BlockedPage() {
  const user = await requireOnboardingUser();
  const blocks = await prisma.block.findMany({
    where: { blockerUserId: user.id },
    include: { blocked: { include: { profile: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="surface stack">
      <SectionTitle title="Geblokkeerde gebruikers" description="Beheer hier welke gebruikers geen contact meer met je kunnen leggen." />
      <div className="list">
        {blocks.length ? blocks.map((block) => (
          <div key={block.id} className="card stack">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <strong>{block.blocked.profile?.displayName ?? block.blocked.email}</strong>
                <p className="muted" style={{ margin: "6px 0 0" }}>{block.blocked.profile?.city ?? "Onbekend"}</p>
              </div>
              <span className="muted">{new Date(block.createdAt).toLocaleDateString("nl-NL")}</span>
            </div>
            <div className="row">
              {block.blocked.profile ? <Link href={`/discover/${block.blocked.profile.id}`} className="btn btn-secondary">Bekijk profiel</Link> : null}
              <form action="/api/blocks" method="post">
                <input type="hidden" name="intent" value="unblock" />
                <input type="hidden" name="blockedUserId" value={block.blockedUserId} />
                <button className="btn btn-secondary" type="submit">Deblokkeer</button>
              </form>
            </div>
          </div>
        )) : <p className="muted" style={{ margin: 0 }}>Je hebt nog niemand geblokkeerd.</p>}
      </div>
    </div>
  );
}
