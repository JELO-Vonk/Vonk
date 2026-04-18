import Link from "next/link";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { KpiCard } from "@/components/ui/KpiCard";

export default function HomePage() {
  return (
    <main className="page">
      <div className="container hero">
        <div className="stack">
          <SectionTitle
            eyebrow="Nederlandse dating + live video"
            title="Ontmoet echte mensen. Minder swipen. Meer echte klik."
            description="Vonk combineert profielmatching met live video roulette, privacyopties en premium zichtbaarheid."
          />
          <div className="row">
            <Link href="/register" className="btn btn-primary">Start gratis</Link>
            <Link href="/how-it-works" className="btn btn-secondary">Bekijk concept</Link>
          </div>
          <div className="grid grid-2">
            <KpiCard label="Gratis" value="25 profielen per dag" hint="5 video connects inbegrepen" />
            <KpiCard label="Gold" value="100 profielen per dag" hint="Meer filters + wie jou liket" />
            <KpiCard label="Platinum" value="Onbeperkt" hint="Volledige incognito + live prioriteit" />
          </div>
        </div>
        <div className="surface">
          <div className="stack">
            <span className="badge">USP</span>
            <h2 style={{ margin: 0 }}>Live video roulette</h2>
            <p className="muted" style={{ margin: 0 }}>
              Geen eindeloze galerij nodig. Start live, ontmoet iemand direct, klik door naar de volgende of like elkaar wederzijds voor een match.
            </p>
            <div className="list">
              <div className="card">1. Start live queue</div>
              <div className="card">2. Kort video-intro gesprek</div>
              <div className="card">3. Wederzijdse like = chat unlock</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
