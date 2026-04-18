import Link from "next/link";

const links = [
  ["/dashboard", "Dashboard"],
  ["/discover", "Ontdekken"],
  ["/likes", "Likes"],
  ["/matches", "Matches"],
  ["/chats", "Chats"],
  ["/notifications", "Meldingen"],
  ["/live", "Live"],
  ["/premium", "Premium"],
  ["/settings", "Instellingen"]
] as const;

export function AppSidebar() {
  return (
    <aside className="surface sidebar">
      <div className="stack">
        {links.map(([href, label]) => (
          <Link key={href} href={href}>{label}</Link>
        ))}
      </div>
    </aside>
  );
}
