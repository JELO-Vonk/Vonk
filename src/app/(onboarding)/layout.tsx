import { requireUser } from "@/lib/auth/guards";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 760 }}>{children}</div>
    </main>
  );
}
