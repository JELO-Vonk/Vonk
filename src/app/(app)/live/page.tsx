import { SectionTitle } from "@/components/ui/SectionTitle";

export default function LivePage() {
  return (
    <div className="surface stack">
      <SectionTitle title="Live video roulette" description="Koppel live met een profiel. Echte WebRTC signaling moet later nog worden aangesloten." />
      <div className="grid grid-2">
        <div className="card stack">
          <strong>Filters</strong>
          <select className="select" defaultValue="NL">
            <option value="NL">Nederland</option>
            <option value="BE">België</option>
          </select>
          <select className="select" defaultValue="25-35">
            <option value="18-24">18-24</option>
            <option value="25-35">25-35</option>
            <option value="36-45">36-45</option>
          </select>
          <button className="btn btn-primary" type="button">Start queue</button>
        </div>
        <div className="card stack">
          <strong>Call viewport</strong>
          <div style={{ minHeight: 240, borderRadius: 16, border: "1px solid var(--border)", display: "grid", placeItems: "center" }}>
            Video placeholder
          </div>
          <div className="row">
            <button className="btn btn-secondary" type="button">Next</button>
            <button className="btn btn-primary" type="button">❤️ Like</button>
            <button className="btn btn-secondary" type="button">Report</button>
          </div>
        </div>
      </div>
    </div>
  );
}
