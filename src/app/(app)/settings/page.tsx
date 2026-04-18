import { SectionTitle } from "@/components/ui/SectionTitle";
import { requireOnboardingUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await requireOnboardingUser();
  const params = await searchParams;
  const blocks = await prisma.block.findMany({
    where: { blockerUserId: user.id },
    include: { blocked: { include: { profile: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="grid grid-2">
      <div className="surface stack">
        <SectionTitle title="Profiel en privacy" description="Basisinstellingen die nu echt aan je profiel gekoppeld zijn." />
        {params.saved ? <div className="alert alert-success">Instelling opgeslagen.</div> : null}
        {params.error ? <div className="alert alert-danger">Actie kon niet worden uitgevoerd.</div> : null}

        <form action="/api/profile/me" method="post" className="stack">
          <input className="input" type="text" name="displayName" defaultValue={user.profile?.displayName ?? ""} placeholder="Weergavenaam" required />
          <input className="input" type="date" name="birthDate" defaultValue={user.profile?.birthDate ? new Date(user.profile.birthDate).toISOString().slice(0, 10) : ""} required />
          <input className="input" type="text" name="city" defaultValue={user.profile?.city ?? ""} placeholder="Stad" />
          <textarea className="textarea" name="bio" defaultValue={user.profile?.bio ?? ""} placeholder="Bio" />
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
          <button className="btn btn-primary" type="submit">Profiel opslaan</button>
        </form>

        <form action="/api/profile/visibility" method="post" className="stack">
          <select className="select" name="visibility" defaultValue={user.profile?.visibility ?? "PUBLIC"}>
            <option value="PUBLIC">Publiek</option>
            <option value="INCOGNITO">Incognito</option>
            <option value="HIDDEN">Verborgen</option>
          </select>
          <button className="btn btn-secondary" type="submit">Zichtbaarheid opslaan</button>
        </form>
      </div>

      <div className="surface stack">
        <SectionTitle title="Blokkades en meldingen" description="Eerste moderatiebasis voor de build." />
        <div className="card stack">
          <strong>Eigen accountinfo</strong>
          <p className="muted" style={{ margin: 0 }}>Trust score: {user.trustScore}</p>
          <p className="muted" style={{ margin: 0 }}>Status: {user.status}</p>
        </div>

        <div className="stack">
          <strong>Geblokkeerde gebruikers</strong>
          {blocks.length ? blocks.map((block) => (
            <div key={block.id} className="card">
              <strong>{block.blocked.profile?.displayName ?? block.blocked.email}</strong>
              <p className="muted" style={{ marginBottom: 0 }}>{block.blocked.email}</p>
            </div>
          )) : <p className="muted" style={{ margin: 0 }}>Nog geen blokkades.</p>}
        </div>
      </div>
    </div>
  );
}
