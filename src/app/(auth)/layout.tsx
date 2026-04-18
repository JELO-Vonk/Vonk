import { PublicHeader } from "@/components/layout/PublicHeader";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main className="page">
        <div className="container" style={{ maxWidth: 520 }}>{children}</div>
      </main>
    </>
  );
}
