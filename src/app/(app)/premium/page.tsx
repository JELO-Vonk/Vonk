import { SectionTitle } from "@/components/ui/SectionTitle";

export default function PremiumPage() {
  return (
    <div className="surface stack">
      <SectionTitle title="Upgrade naar premium" description="Koppel deze pagina later aan Stripe of Mollie checkout." />
      <div className="grid grid-2">
        <div className="card stack"><strong>Gold</strong><span className="muted">100 profielen / 25 video connects / wie jou liket</span></div>
        <div className="card stack"><strong>Platinum</strong><span className="muted">Onbeperkt / incognito / queue prioriteit</span></div>
      </div>
    </div>
  );
}
