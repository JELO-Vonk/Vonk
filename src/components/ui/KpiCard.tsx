type Props = {
  label: string;
  value: string;
  hint?: string;
};

export function KpiCard({ label, value, hint }: Props) {
  return (
    <div className="kpi">
      <div className="muted" style={{ fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{value}</div>
      {hint ? <div className="muted" style={{ fontSize: 13, marginTop: 8 }}>{hint}</div> : null}
    </div>
  );
}
