import { requireOnboardingUser } from "@/lib/auth/guards";
import { SectionTitle } from "@/components/ui/SectionTitle";

export default async function SettingsProfilePage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [user, query] = await Promise.all([requireOnboardingUser(), searchParams]);
  const profile = user.profile;

  return (
    <div className="surface stack">
      <SectionTitle title="Profiel" description="Werk hier je basisprofielgegevens bij." />
      {query.saved ? <div className="alert alert-success">Profiel opgeslagen.</div> : null}
      <form action="/api/profile/me" method="post" className="stack">
        <input type="hidden" name="returnTo" value="/settings/profile?saved=1" />
        <label className="stack">
          <span>Weergavenaam</span>
          <input className="input" name="displayName" defaultValue={profile?.displayName ?? ""} />
        </label>
        <label className="stack">
          <span>Geboortedatum</span>
          <input className="input" type="date" name="birthDate" defaultValue={profile?.birthDate ? new Date(profile.birthDate).toISOString().slice(0,10) : ""} />
        </label>
        <div className="row">
          <label className="stack" style={{ flex: 1 }}>
            <span>Gender</span>
            <select name="gender" className="input" defaultValue={profile?.gender ?? "MAN"}>
              <option value="MAN">Man</option>
              <option value="WOMAN">Vrouw</option>
              <option value="NON_BINARY">Non-binair</option>
              <option value="OTHER">Anders</option>
            </select>
          </label>
          <label className="stack" style={{ flex: 1 }}>
            <span>Geïnteresseerd in</span>
            <select name="interestedIn" className="input" defaultValue={profile?.interestedIn ?? "EVERYONE"}>
              <option value="MEN">Mannen</option>
              <option value="WOMEN">Vrouwen</option>
              <option value="EVERYONE">Iedereen</option>
              <option value="NON_BINARY">Non-binair</option>
            </select>
          </label>
        </div>
        <label className="stack">
          <span>Stad</span>
          <input className="input" name="city" defaultValue={profile?.city ?? ""} />
        </label>
        <label className="stack">
          <span>Bio</span>
          <textarea className="textarea" name="bio" defaultValue={profile?.bio ?? ""} rows={5} />
        </label>
        <button className="btn btn-primary" type="submit">Opslaan</button>
      </form>
    </div>
  );
}
