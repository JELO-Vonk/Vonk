import { requireAdmin } from "@/lib/auth/guards";
import Link from "next/link";

const links = [
  ["/admin", "Dashboard"],
  ["/admin/users", "Gebruikers"],
  ["/admin/reports", "Reports"],
  ["/admin/moderation", "Moderatie"],
  ["/admin/subscriptions", "Abonnementen"],
  ["/admin/purchases", "Aankopen"],
  ["/admin/video-calls", "Video calls"],
  ["/admin/audit-logs", "Audit logs"]
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <main className="page">
      <div className="container sidebar-layout">
        <aside className="surface sidebar">
          <div className="stack">
            {links.map(([href, label]) => (
              <Link key={href} href={href}>{label}</Link>
            ))}
          </div>
        </aside>
        <div className="stack">{children}</div>
      </div>
    </main>
  );
}
