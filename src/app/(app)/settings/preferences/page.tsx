import { requireOnboardingUser } from "@/lib/auth/guards";
import { SectionTitle } from "@/components/ui/SectionTitle";

export default async function SettingsPreferencesPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [user, query] = await Promise.all([requireOnboardingUser(), searchParams]);
  const preferences = user.preferences;

  return (
    <div className="surface stack">
      <SectionTitle title="Voorkeuren" description="Stel in wie je wilt zien in ontdekken en live." />
      {query.saved ? <div className="alert alert-success">Voorkeuren opgeslagen.</div> : null}
      <form action="/api/profile/preferences" method="post" className="stack">
        <div className="row">
          <label className="stack" style={{ flex: 1 }}>
            <span>Min leeftijd</span>
            <input className="input" type="number" name="minAge" min="18" max="99" defaultValue={preferences?.minAge ?? 18} />
          </label>
          <label className="stack" style={{ flex: 1 }}>
            <span>Max leeftijd</span>
            <input className="input" type="number" name="maxAge" min="18" max="99" defaultValue={preferences?.maxAge ?? 50} />
          </label>
        </div>
        <label className="stack">
          <span>Max afstand in km</span>
          <input className="input" type="number" name="maxDistanceKm" min="1" max="500" defaultValue={preferences?.maxDistanceKm ?? 100} />
        </label>
        <label className="row"><input type="checkbox" name="showVerifiedOnly" defaultChecked={preferences?.showVerifiedOnly ?? false} /> <span>Alleen geverifieerde profielen</span></label>
        <label className="row"><input type="checkbox" name="showOnlineOnly" defaultChecked={preferences?.showOnlineOnly ?? false} /> <span>Alleen recent actieve profielen</span></label>
        <div className="row" style={{ gap: 16, flexWrap: "wrap" }}>
          <label className="row"><input type="checkbox" name="allowMen" defaultChecked={preferences?.allowMen ?? true} /> <span>Mannen</span></label>
          <label className="row"><input type="checkbox" name="allowWomen" defaultChecked={preferences?.allowWomen ?? true} /> <span>Vrouwen</span></label>
          <label className="row"><input type="checkbox" name="allowNonBinary" defaultChecked={preferences?.allowNonBinary ?? true} /> <span>Non-binair</span></label>
        </div>
        <button className="btn btn-primary" type="submit">Opslaan</button>
      </form>
    </div>
  );
}
