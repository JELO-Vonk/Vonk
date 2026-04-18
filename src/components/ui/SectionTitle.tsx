type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionTitle({ eyebrow, title, description }: Props) {
  return (
    <div className="stack" style={{ gap: 8 }}>
      {eyebrow ? <span className="badge">{eyebrow}</span> : null}
      <h1 style={{ margin: 0, fontSize: 36 }}>{title}</h1>
      {description ? <p className="muted" style={{ margin: 0 }}>{description}</p> : null}
    </div>
  );
}
