import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOnboardingUser } from "@/lib/auth/guards";
import { getChatById } from "@/lib/chat/getChat";

const errorMessages: Record<string, string> = {
  missing_message: "Bericht ontbreekt.",
  rate_limited: "Je verstuurt te snel berichten. Wacht even.",
  spam_blocked: "Bericht geblokkeerd door anti-spam.",
};

type Props = {
  params: Promise<{ chatId: string }>;
  searchParams: Promise<{ sent?: string; error?: string }>;
};

export default async function ChatDetailPage({ params, searchParams }: Props) {
  const [{ chatId }, query, user] = await Promise.all([params, searchParams, requireOnboardingUser()]);
  const chat = await getChatById(chatId, user.id);

  if (!chat) notFound();

  const counterpart = chat.match.userAId === user.id ? chat.match.userB : chat.match.userA;

  return (
    <div className="surface stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="stack" style={{ gap: 4 }}>
          <h1 style={{ margin: 0 }}>{counterpart.profile?.displayName ?? counterpart.email}</h1>
          <div className="muted">{counterpart.profile?.city ?? "Onbekend"}</div>
        </div>
        <div className="row">
          {counterpart.profile ? <Link href={`/discover/${counterpart.profile.id}`} className="btn btn-secondary">Profiel</Link> : null}
          <Link href="/chats" className="btn btn-secondary">Terug</Link>
        </div>
      </div>

      {query.sent ? <div className="alert alert-success">Bericht verzonden.</div> : null}
      {query.error ? <div className="alert alert-danger">{errorMessages[query.error] ?? "Bericht kon niet worden verzonden."}</div> : null}

      <div className="chat-thread list">
        {chat.messages.length ? chat.messages.map((message) => {
          const mine = message.senderUserId === user.id;
          return (
            <div key={message.id} className={`chat-bubble ${mine ? "chat-bubble-me" : "chat-bubble-other"}`}>
              <strong>{mine ? "Jij" : (counterpart.profile?.displayName ?? "Match")}</strong>
              <div>{message.body ?? "(leeg bericht)"}</div>
              <div className="muted" style={{ fontSize: 12 }}>{new Date(message.createdAt).toLocaleString("nl-NL")}</div>
            </div>
          );
        }) : <p className="muted" style={{ margin: 0 }}>Nog geen berichten. Start het gesprek.</p>}
      </div>

      <form action={`/api/chats/${chat.id}/messages`} method="post" className="row" style={{ alignItems: "stretch" }}>
        <input className="input" name="body" placeholder={`Typ een bericht naar ${counterpart.profile?.displayName ?? counterpart.email}...`} />
        <button className="btn btn-primary" type="submit">Verstuur</button>
      </form>

      <div className="card stack">
        <strong>Veiligheid</strong>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <form action="/api/blocks" method="post">
            <input type="hidden" name="blockedUserId" value={counterpart.id} />
            <button className="btn btn-secondary" type="submit">Blokkeer gebruiker</button>
          </form>
        </div>
        <form action="/api/reports" method="post" className="stack">
          <input type="hidden" name="reportedUserId" value={counterpart.id} />
          <input type="hidden" name="contextType" value="CHAT" />
          <input type="hidden" name="returnTo" value={`/chats/${chat.id}`} />
          <select name="reasonCode" className="input" defaultValue="OTHER">
            <option value="HARASSMENT">Lastig gedrag</option>
            <option value="SPAM">Spam</option>
            <option value="SCAM">Scam</option>
            <option value="HATEFUL_BEHAVIOR">Haatdragend gedrag</option>
            <option value="OTHER">Overig</option>
          </select>
          <textarea className="textarea" name="notes" rows={3} placeholder="Licht je melding kort toe (optioneel)" />
          <button className="btn btn-secondary" type="submit">Meld gesprek</button>
        </form>
      </div>
    </div>
  );
}
