import { requireOnboardingUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { SectionTitle } from "@/components/ui/SectionTitle";

export default async function SettingsPhotosPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [user, query] = await Promise.all([requireOnboardingUser(), searchParams]);
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: { media: { orderBy: { sortOrder: "asc" } } }
  });

  return (
    <div className="surface stack">
      <SectionTitle title="Foto's en introvideo" description="Gebruik in deze batch URL's als media-basis. Echte file-uploads kunnen we later erop zetten." />
      {query.saved ? <div className="alert alert-success">Media-instellingen opgeslagen.</div> : null}

      <form action="/api/profile/media" method="post" className="stack">
        <input type="hidden" name="intent" value="update_profile_media" />
        <label className="stack">
          <span>Avatar URL</span>
          <input className="input" name="avatarUrl" defaultValue={profile?.avatarUrl ?? ""} placeholder="https://..." />
        </label>
        <label className="stack">
          <span>Introvideo URL</span>
          <input className="input" name="introVideoUrl" defaultValue={profile?.introVideoUrl ?? ""} placeholder="https://..." />
        </label>
        <button className="btn btn-primary" type="submit">Opslaan</button>
      </form>

      <div className="card stack">
        <strong>Nieuwe media toevoegen</strong>
        <form action="/api/profile/media" method="post" className="stack">
          <input type="hidden" name="intent" value="add_media" />
          <label className="stack">
            <span>Type</span>
            <select name="type" className="input" defaultValue="photo">
              <option value="photo">Foto</option>
              <option value="video">Video</option>
            </select>
          </label>
          <label className="stack">
            <span>Bestands- of CDN URL</span>
            <input className="input" name="originalUrl" placeholder="https://..." />
          </label>
          <label className="stack">
            <span>Thumbnail URL (optioneel)</span>
            <input className="input" name="thumbUrl" placeholder="https://..." />
          </label>
          <button className="btn btn-secondary" type="submit">Media toevoegen</button>
        </form>
      </div>

      <div className="list">
        {profile?.media.length ? profile.media.map((item) => (
          <div key={item.id} className="card stack">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <strong>{item.type === "video" ? "Video" : "Foto"}</strong>
              <span className="muted">positie {item.sortOrder + 1}</span>
            </div>
            <div className="muted" style={{ wordBreak: "break-all" }}>{item.originalUrl ?? item.storageKey}</div>
            <form action="/api/profile/media" method="post" className="row">
              <input type="hidden" name="intent" value="delete_media" />
              <input type="hidden" name="mediaId" value={item.id} />
              <button className="btn btn-secondary" type="submit">Verwijder</button>
            </form>
          </div>
        )) : <p className="muted" style={{ margin: 0 }}>Nog geen extra media toegevoegd.</p>}
      </div>
    </div>
  );
}
