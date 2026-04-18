import Link from "next/link";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { requireOnboardingUser } from "@/lib/auth/guards";
import { getUserChats } from "@/lib/chat/getChat";

const chatErrors: Record<string, string> = {
  missing_message: "Bericht ontbreekt.",
  forbidden: "Deze chat is niet beschikbaar.",
  rate_limited: "Je verstuurt te snel berichten. Wacht heel even.",
  spam_blocked: "Bericht geblokkeerd door anti-spam.",
};

export default async function ChatsPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const user = await requireOnboardingUser();
  const params = await searchParams;
  const chats = await getUserChats(user.id);

  return (
    <div className="surface stack">
      <SectionTitle title="Chats" description="Elke match heeft nu een eigen chatdetailpagina met directe berichtflow." />
      {params.sent ? <div className="alert alert-success">Bericht verzonden.</div> : null}
      {params.error ? <div className="alert alert-danger">{chatErrors[params.error] ?? "Bericht kon niet worden verstuurd."}</div> : null}
      <div className="list">
        {chats.length ? chats.map((chat) => {
          const counterpart = chat.match.userAId === user.id ? chat.match.userB : chat.match.userA;
          const lastMessage = chat.messages[0];
          return (
            <div key={chat.id} className="card stack">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <strong>{counterpart.profile?.displayName ?? counterpart.email}</strong>
                <span className="muted">{chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleString("nl-NL") : "Nog geen berichten"}</span>
              </div>
              <p className="muted" style={{ margin: 0 }}>{lastMessage?.body ?? "Start dit gesprek met je eerste bericht."}</p>
              <div className="row">
                {counterpart.profile ? <Link href={`/discover/${counterpart.profile.id}`} className="btn btn-secondary">Profiel</Link> : null}
                <Link href={`/chats/${chat.id}`} className="btn btn-primary">Open chat</Link>
              </div>
            </div>
          );
        }) : <p className="muted" style={{ margin: 0 }}>Nog geen chats. Maak eerst een match via ontdekken.</p>}
      </div>
    </div>
  );
}
