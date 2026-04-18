"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function PushToggle({ enabledByDefault = false }: { enabledByDefault?: boolean }) {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(enabledByDefault);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window);
  }, []);

  async function enablePush() {
    setBusy(true);
    setMessage(null);
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const configRes = await fetch("/api/notifications/push/public-key");
      const config = await configRes.json();
      const publicKey = config.publicKey as string;
      if (!publicKey) {
        throw new Error("Geen web push public key ingesteld in .env");
      }
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });
      const saveRes = await fetch("/api/notifications/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription)
      });
      if (!saveRes.ok) throw new Error("Opslaan van push subscription mislukt");
      setEnabled(true);
      setMessage("Browsermeldingen staan aan.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Push activeren mislukt");
    } finally {
      setBusy(false);
    }
  }

  async function disablePush() {
    setBusy(true);
    setMessage(null);
    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js") || await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/notifications/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
        await subscription.unsubscribe();
      }
      setEnabled(false);
      setMessage("Browsermeldingen staan uit.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Push uitschakelen mislukt");
    } finally {
      setBusy(false);
    }
  }

  if (!supported) {
    return <p className="muted">Browser push wordt in deze browser niet ondersteund.</p>;
  }

  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <strong>Browsermeldingen</strong>
          <div className="muted">Krijg een melding bij een nieuwe match of nieuw bericht.</div>
        </div>
        {enabled ? (
          <button type="button" className="btn btn-secondary" onClick={disablePush} disabled={busy}>Uitzetten</button>
        ) : (
          <button type="button" className="btn" onClick={enablePush} disabled={busy}>Aanzetten</button>
        )}
      </div>
      {message ? <div className="muted">{message}</div> : null}
    </div>
  );
}
