import Link from "next/link";
import { requireOnboardingUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { PushToggle } from "@/components/notifications/PushToggle";
import { NotificationAutoRefresh } from "@/components/notifications/NotificationAutoRefresh";

export default async function NotificationsPage() {
  const user = await requireOnboardingUser();
  const [notifications, preferences, pushCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50
    }),
    prisma.userPreference.findUnique({ where: { userId: user.id } }),
    prisma.pushSubscription.count({ where: { userId: user.id } })
  ]);

  return (
    <div className="stack">
      <NotificationAutoRefresh />
      <div className="surface stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <h1>Meldingen</h1>
            <p className="muted">Je laatste platformmeldingen, matches en chatupdates.</p>
          </div>
          <form action="/api/notifications/read" method="post">
            <button className="btn btn-secondary" type="submit">Alles als gelezen</button>
          </form>
        </div>

        <div className="card stack">
          <h2 style={{ margin: 0 }}>Push & e-mail</h2>
          <div className="muted">Actieve browser subscriptions: {pushCount}</div>
          <PushToggle enabledByDefault={pushCount > 0} />
          <form action="#" className="stack" onSubmit={undefined}>
            <div className="row" style={{ gap: 18, flexWrap: "wrap" }}>
              <label><input type="checkbox" defaultChecked={preferences?.emailNewMatches ?? true} disabled /> E-mail bij nieuwe match</label>
              <label><input type="checkbox" defaultChecked={preferences?.emailNewMessages ?? true} disabled /> E-mail bij nieuw bericht</label>
              <label><input type="checkbox" defaultChecked={preferences?.pushNewMatches ?? false} disabled /> Push bij nieuwe match</label>
              <label><input type="checkbox" defaultChecked={preferences?.pushNewMessages ?? false} disabled /> Push bij nieuw bericht</label>
            </div>
            <div className="muted">Voorkeurenstructuur staat klaar in de database voor batch 13. In deze batch kun je browser push al aan- en uitzetten.</div>
          </form>
        </div>
      </div>
      <div className="surface stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>Recente meldingen</h2>
          <Link className="btn btn-secondary" href="/premium">Premium</Link>
        </div>
        <div className="stack">
          {notifications.length ? notifications.map((item) => (
            <div key={item.id} className="card stack" style={{ gap: 8, borderLeft: item.readAt ? undefined : "3px solid var(--accent)" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <strong>{item.title}</strong>
                <span className="muted">{new Date(item.createdAt).toLocaleString("nl-NL")}</span>
              </div>
              {item.body ? <div className="muted">{item.body}</div> : null}
              <div className="row">
                <span className="badge">{item.type}</span>
                {item.href ? <Link className="btn btn-secondary" href={item.href}>Open</Link> : null}
              </div>
            </div>
          )) : <div className="muted">Nog geen meldingen.</div>}
        </div>
      </div>
    </div>
  );
}
