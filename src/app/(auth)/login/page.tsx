import { SectionTitle } from "@/components/ui/SectionTitle";

const errorMessages: Record<string, string> = {
  missing: "Vul je e-mailadres en wachtwoord in.",
  invalid: "De combinatie van e-mailadres en wachtwoord klopt niet.",
  banned: "Dit account is niet beschikbaar."
};

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const error = params.error ? errorMessages[params.error] : null;

  return (
    <div className="surface stack">
      <SectionTitle title="Inloggen" description="Log in om te ontdekken, matchen en chatten." />
      {error ? <div className="alert alert-danger">{error}</div> : null}
      <form action="/api/auth/login" method="post" className="stack">
        <input className="input" type="email" name="email" placeholder="E-mailadres" autoComplete="email" required />
        <input className="input" type="password" name="password" placeholder="Wachtwoord" autoComplete="current-password" required />
        <button className="btn btn-primary" type="submit">Inloggen</button>
      </form>
      <p className="muted" style={{ margin: 0 }}>Demo na seeden: <strong>demo@vonk.local</strong> / <strong>ChangeMe123!</strong></p>
    </div>
  );
}
