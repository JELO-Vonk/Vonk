import { requireOnboardingUser } from "@/lib/auth/guards";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { LiveRoom } from "@/components/live/LiveRoom";

export default async function LivePage() {
  const user = await requireOnboardingUser();
  const plan = user.subscriptions[0]?.tier ?? "FREE";

  return (
    <div className="surface stack">
      <SectionTitle
        title="Live video roulette"
        description="Batch 7: echte 2-browser WebRTC basis via polling-signaling, premium live limieten en direct door naar match/chat bij wederzijdse like."
      />
      <div className="row">
        <span className="badge">Plan: {plan}</span>
        <span className="badge">Free 5 / Gold 25 / Platinum onbeperkt</span>
        <span className="badge">Dev STUN actief</span>
      </div>
      <LiveRoom currentUserId={user.id} currentPlan={plan} />
    </div>
  );
}
