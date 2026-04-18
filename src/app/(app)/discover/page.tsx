import Link from "next/link";
import { getDiscoveryFeed } from "@/lib/discover/feed";
import { SectionTitle } from "@/components/ui/SectionTitle";

const errorMessages: Record<string, string> = {
  missing_profile: "Geen profiel geselecteerd.",
  invalid_profile: "Dit profiel is niet beschikbaar.",
  limit_reached: "Je daglimiet voor profielen is bereikt. Upgrade voor meer bereik.",
  rate_limited: "Je gaat te snel. Wacht even en probeer opnieuw."
};

export default async function DiscoverPage({ searchParams }: { searchParams: Promise<{ error?: string; liked?: string; passed?: string; matched?: string; city?: string; verified?: string }> }) {
  const query = await searchParams;
  const payload = await getDiscoveryFeed(12, { city: query.city, verifiedOnly: query.verified === "1" });
  const feedback = query.error ? errorMessages[query.error] : query.matched ? "Match! Jullie kunnen nu direct chatten." : query.liked ? "Like opgeslagen." : query.passed ? "Profiel overgeslagen." : null;

  return (
    <>
      <div className="surface stack">
        <SectionTitle title="Ontdekken" description="Browse profielen, open details en maak matches met wederzijdse likes." />
        <div className="row muted">
          <span>Plan: <strong>{payload.tier}</strong></span>
          <span>•</span>
          <span>Vandaag bekeken: <strong>{payload.usage.profileViewsUsed}</strong></span>
          <span>•</span>
          <span>{payload.remaining === null ? "Nog onbeperkt" : `Nog ${payload.remaining} over vandaag`}</span>
        </div>
        <form method="get" className="row" style={{ alignItems: "end", flexWrap: "wrap" }}>
          <label className="stack" style={{ minWidth: 220 }}>
            <span>Filter op stad</span>
            <input className="input" name="city" defaultValue={query.city ?? ""} placeholder="bijv. Groningen" />
          </label>
          <label className="row">
            <input type="checkbox" name="verified" value="1" defaultChecked={query.verified === "1"} />
            <span>Alleen geverifieerd</span>
          </label>
          <button className="btn btn-secondary" type="submit">Filters toepassen</button>
          <Link href="/discover" className="btn btn-secondary">Reset</Link>
        </form>
        {feedback ? <div className={`alert ${query.error ? "alert-danger" : "alert-success"}`}>{feedback}</div> : null}
      </div>
      <div className="grid grid-2">
        {payload.feed.length ? payload.feed.map((profile) => (
          <div key={profile.id} className="card stack">
            <Link href={`/discover/${profile.id}`} className="profile-cover">
              <div className="profile-avatar">{profile.displayName.slice(0, 1).toUpperCase()}</div>
              {profile.spotlights.length ? <span className="badge">Spotlight</span> : null}
            </Link>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <strong>{profile.displayName}</strong>
              <span className="muted">score {profile.completionScore}</span>
            </div>
            <p className="muted" style={{ margin: 0 }}>{profile.city ?? "Onbekend"}</p>
            <p style={{ margin: 0 }}>{profile.bio ?? "Nog geen bio ingevuld."}</p>
            <div className="row">
              <Link href={`/discover/${profile.id}`} className="btn btn-secondary">Bekijk profiel</Link>
              <form action="/api/discover/pass" method="post">
                <input type="hidden" name="profileId" value={profile.id} />
                <button className="btn btn-secondary" type="submit">Skip</button>
              </form>
              <form action="/api/discover/like" method="post">
                <input type="hidden" name="profileId" value={profile.id} />
                <button className="btn btn-primary" type="submit">Like</button>
              </form>
            </div>
          </div>
        )) : (
          <div className="surface">
            <p style={{ margin: 0 }}>Er zijn nu geen nieuwe profielen beschikbaar binnen je huidige feed of filters.</p>
          </div>
        )}
      </div>
    </>
  );
}
