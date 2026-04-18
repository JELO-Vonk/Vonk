import { requireUser } from "@/lib/auth/guards";
import { SectionTitle } from "@/components/ui/SectionTitle";

const errorMessages: Record<string, string> = {
  missing_profile: "Vul minimaal je naam en geboortedatum in."
};

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const error = params.error ? errorMessages[params.error] : null;

  return (
    <div className="surface stack">
      <SectionTitle title="Onboarding" description="Maak eerst je profiel compleet zodat Vonk je kan tonen in ontdekken." />
      {error ? <div className="alert alert-danger">{error}</div> : null}
      <form action="/api/onboarding/complete" method="post" className="stack">
        <div className="grid grid-2">
          <input className="input" type="text" name="displayName" defaultValue={user.profile?.displayName ?? ""} placeholder="Weergavenaam" required />
          <input className="input" type="date" name="birthDate" defaultValue={user.profile?.birthDate ? new Date(user.profile.birthDate).toISOString().slice(0, 10) : ""} required />
        </div>

        <div className="grid grid-2">
          <select className="select" name="gender" defaultValue={user.profile?.gender ?? "MAN"}>
            <option value="MAN">Man</option>
            <option value="WOMAN">Vrouw</option>
            <option value="NON_BINARY">Non-binair</option>
            <option value="OTHER">Anders</option>
          </select>
          <select className="select" name="interestedIn" defaultValue={user.profile?.interestedIn ?? "EVERYONE"}>
            <option value="MEN">Mannen</option>
            <option value="WOMEN">Vrouwen</option>
            <option value="EVERYONE">Iedereen</option>
            <option value="NON_BINARY">Non-binair</option>
          </select>
        </div>

        <input className="input" type="text" name="city" defaultValue={user.profile?.city ?? ""} placeholder="Stad" />
        <textarea className="textarea" name="bio" defaultValue={user.profile?.bio ?? ""} placeholder="Vertel kort iets over jezelf" />
        <button className="btn btn-primary" type="submit">Profiel opslaan</button>
      </form>
    </div>
  );
}
