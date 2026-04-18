import { requireOnboardingUser } from "@/lib/auth/guards";
import { SectionTitle } from "@/components/ui/SectionTitle";

export default async function SettingsPrivacyPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [user, query] = await Promise.all([requireOnboardingUser(), searchParams]);
  const profile = user.profile;

  return (
    <div className="surface stack">
      <SectionTitle title="Privacy" description="Beheer incognito en zichtbaarheid van je profiel." />
      {query.saved ? <div className="alert alert-success">Privacy-instellingen opgeslagen.</div> : null}
      <form action="/api/profile/visibility" method="post" className="stack">
        <label className="stack">
          <span>Zichtbaarheid</span>
          <select name="visibility" className="input" defaultValue={profile?.visibility ?? "PUBLIC"}>
            <option value="PUBLIC">Openbaar</option>
            <option value="INCOGNITO">Incognito</option>
            <option value="HIDDEN">Verborgen</option>
          </select>
        </label>
        <label className="row">
          <input type="checkbox" name="isDiscoverable" defaultChecked={profile?.isDiscoverable ?? true} />
          <span>Profiel tonen in ontdek-feed</span>
        </label>
        <label className="row">
          <input type="checkbox" name="isVisible" defaultChecked={profile?.isVisible ?? true} />
          <span>Profiel actief zichtbaar houden</span>
        </label>
        <button className="btn btn-primary" type="submit">Opslaan</button>
      </form>
    </div>
  );
}
