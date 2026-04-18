import Link from "next/link";
import { requireOnboardingUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

export default async function NotificationsPage() {
  const user = await requireOnboardingUser();
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
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
  );
}
