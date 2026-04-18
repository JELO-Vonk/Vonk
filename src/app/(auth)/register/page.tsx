import { SectionTitle } from "@/components/ui/SectionTitle";

const errorMessages: Record<string, string> = {
  missing: "E-mailadres en wachtwoord zijn verplicht.",
  weak_password: "Gebruik minimaal 8 tekens voor je wachtwoord.",
  exists: "Er bestaat al een account met dit e-mailadres."
};

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const error = params.error ? errorMessages[params.error] : null;

  return (
    <div className="surface stack">
      <SectionTitle title="Registreren" description="Maak je account en ga daarna direct door naar onboarding." />
      {error ? <div className="alert alert-danger">{error}</div> : null}
      <form action="/api/auth/register" method="post" className="stack">
        <input className="input" type="email" name="email" placeholder="E-mailadres" autoComplete="email" required />
        <input className="input" type="password" name="password" placeholder="Wachtwoord" autoComplete="new-password" required minLength={8} />
        <button className="btn btn-primary" type="submit">Account maken</button>
      </form>
    </div>
  );
}
