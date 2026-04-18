import { requireOnboardingUser } from "@/lib/auth/guards";
import { AppSidebar } from "@/components/layout/AppSidebar";
import Link from "next/link";
import { getUnreadNotificationCount } from "@/lib/notifications";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireOnboardingUser();
  const plan = user.subscriptions[0]?.tier ?? "FREE";
  const unreadNotifications = await getUnreadNotificationCount(user.id);

  return (
    <main className="page">
      <div className="container">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
          <div className="brand">Vonk</div>
          <div className="row">
            <span className="badge">{plan}</span>
            <span className="badge">{user.profile?.displayName ?? user.email}</span>
            <Link href="/notifications" className="badge">Meldingen{unreadNotifications ? ` (${unreadNotifications})` : ""}</Link>
            <Link href="/api/auth/logout" className="btn btn-secondary">Uitloggen</Link>
          </div>
        </div>
        <div className="sidebar-layout">
          <AppSidebar />
          <div className="stack">{children}</div>
        </div>
      </div>
    </main>
  );
}
