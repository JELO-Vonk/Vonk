"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type LiveStatusResponse = {
  queueSession: { id: string } | null;
  call: {
    id: string;
    signalingRoomKey: string;
    startedAt: string;
    isCaller: boolean;
    peer: {
      userId: string;
      profileId: string | null;
      displayName: string;
      avatarUrl: string | null;
      city: string | null;
      verificationStatus: string;
    } | null;
  } | null;
};

type Props = {
  currentUserId: string;
  currentPlan: string;
};

export function LiveRoom({ currentUserId, currentPlan }: Props) {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const pollRef = useRef<number | null>(null);
  const signalRef = useRef<number | null>(null);
  const lastSignalIdRef = useRef(0);
  const setupCallIdRef = useRef<string | null>(null);

  const [statusText, setStatusText] = useState("Klaar om live te gaan.");
  const [queueSessionId, setQueueSessionId] = useState<string | null>(null);
  const [call, setCall] = useState<LiveStatusResponse["call"]>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const hasActiveCall = Boolean(call?.id);

  const startLocalPreview = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: true
    });
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    setCameraReady(true);
    return stream;
  }, []);

  const destroyPeer = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.onicecandidate = null;
      peerRef.current.ontrack = null;
      peerRef.current.close();
      peerRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    lastSignalIdRef.current = 0;
    setupCallIdRef.current = null;
  }, []);

  const publishSignal = useCallback(async (callId: string, kind: "offer" | "answer" | "candidate", payload: unknown) => {
    await fetch("/api/live/signaling/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callId, kind, payload })
    });
  }, []);

  const ensurePeerConnection = useCallback(async (activeCall: NonNullable<LiveStatusResponse["call"]>) => {
    if (setupCallIdRef.current === activeCall.id && peerRef.current) {
      return peerRef.current;
    }

    destroyPeer();
    const localStream = await startLocalPreview();
    const remoteStream = new MediaStream();
    remoteStreamRef.current = remoteStream;
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }]
    });
    peerRef.current = pc;
    setupCallIdRef.current = activeCall.id;

    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    pc.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach((track) => remoteStream.addTrack(track));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        void publishSignal(activeCall.id, "candidate", event.candidate.toJSON());
      }
    };

    if (activeCall.isCaller) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await publishSignal(activeCall.id, "offer", offer);
      setStatusText("Aan het verbinden met de andere gebruiker...");
    } else {
      setStatusText("Wachten op video-offer van de andere gebruiker...");
    }

    return pc;
  }, [destroyPeer, publishSignal, startLocalPreview]);

  const processSignals = useCallback(async (activeCall: NonNullable<LiveStatusResponse["call"]>) => {
    const response = await fetch(`/api/live/signaling/poll?callId=${encodeURIComponent(activeCall.id)}&since=${lastSignalIdRef.current}`, { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    const signals = Array.isArray(data.signals) ? data.signals : [];
    if (!signals.length) return;

    const pc = await ensurePeerConnection(activeCall);

    for (const signal of signals) {
      lastSignalIdRef.current = Math.max(lastSignalIdRef.current, Number(signal.id) || 0);
      if (signal.kind === "offer") {
        if (!pc.currentRemoteDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await publishSignal(activeCall.id, "answer", answer);
          setStatusText("Videoverbinding opzetten...");
        }
      } else if (signal.kind === "answer") {
        if (!pc.currentRemoteDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
          setStatusText("Verbonden. Zeg hallo 👋");
        }
      } else if (signal.kind === "candidate") {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(signal.payload));
        } catch {
          // candidate may arrive before descriptions; ignore quietly in this dev batch
        }
      }
    }
  }, [ensurePeerConnection, publishSignal]);

  const refreshStatus = useCallback(async () => {
    const response = await fetch("/api/live/status", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    const liveStatus = data.status as LiveStatusResponse;
    setQueueSessionId(liveStatus.queueSession?.id ?? null);
    setCall(liveStatus.call ?? null);

    if (!liveStatus.call) {
      destroyPeer();
      if (liveStatus.queueSession) {
        setStatusText("Je staat in de wachtrij. Even geduld...");
      } else {
        setStatusText("Klaar om live te gaan.");
      }
      return;
    }

    await ensurePeerConnection(liveStatus.call);
  }, [destroyPeer, ensurePeerConnection]);

  useEffect(() => {
    void refreshStatus();
    pollRef.current = window.setInterval(() => {
      void refreshStatus();
    }, 2000);

    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      if (signalRef.current) window.clearInterval(signalRef.current);
      destroyPeer();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
    };
  }, [destroyPeer, refreshStatus]);

  useEffect(() => {
    if (!call?.id) {
      if (signalRef.current) window.clearInterval(signalRef.current);
      signalRef.current = null;
      return;
    }
    void processSignals(call);
    if (signalRef.current) window.clearInterval(signalRef.current);
    signalRef.current = window.setInterval(() => {
      void processSignals(call);
    }, 1200);

    return () => {
      if (signalRef.current) window.clearInterval(signalRef.current);
      signalRef.current = null;
    };
  }, [call, processSignals]);

  const startQueue = useCallback(async () => {
    setIsBusy(true);
    try {
      await startLocalPreview();
      const response = await fetch("/api/live/queue/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters: { mode: "default" } })
      });
      const data = await response.json();
      if (data?.result?.reason === "video_limit_reached") {
        setStatusText(`Je ${currentPlan.toLowerCase()} limiet voor live video is bereikt.`);
      } else {
        setStatusText(data?.result?.matched ? "Live match gevonden. Video wordt opgezet..." : "Je staat in de wachtrij. Even geduld...");
      }
      await refreshStatus();
    } finally {
      setIsBusy(false);
    }
  }, [currentPlan, refreshStatus, startLocalPreview]);

  const leaveQueue = useCallback(async () => {
    if (!queueSessionId) return;
    setIsBusy(true);
    try {
      await fetch("/api/live/queue/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: queueSessionId })
      });
      await refreshStatus();
    } finally {
      setIsBusy(false);
    }
  }, [queueSessionId, refreshStatus]);

  const postCallAction = useCallback(async (action: "like" | "next" | "report" | "end") => {
    if (!call?.id) return;
    setIsBusy(true);
    try {
      const response = await fetch(`/api/live/calls/${call.id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: action === "report" ? JSON.stringify({ notes: "Gemeld vanuit live room." }) : undefined
      });
      const data = await response.json().catch(() => ({}));
      if (action === "like" && data?.matchId) {
        setStatusText("Wederzijdse like! Er is een match en chat aangemaakt.");
      } else if (action === "like") {
        setStatusText("Like verstuurd. Wachten op reactie van de ander...");
      } else if (action === "report") {
        setStatusText("Gebruiker gemeld en gesprek beëindigd.");
      } else {
        setStatusText("Gesprek beëindigd.");
      }
      await refreshStatus();
    } finally {
      setIsBusy(false);
    }
  }, [call?.id, refreshStatus]);

  const peerLabel = useMemo(() => {
    if (!call?.peer) return "Nog niemand gekoppeld";
    const parts = [call.peer.displayName];
    if (call.peer.city) parts.push(call.peer.city);
    return parts.join(" • ");
  }, [call?.peer]);

  return (
    <div className="grid grid-2">
      <div className="card stack">
        <strong>Jouw camera</strong>
        <div className="video-shell video-local">
          <video ref={localVideoRef} autoPlay playsInline muted className="video-el" />
        </div>
        <div className="muted">{cameraReady ? "Camera actief" : "Camera nog niet gestart"}</div>
        <div className="row">
          <button className="btn btn-primary" type="button" disabled={isBusy || !!queueSessionId || hasActiveCall} onClick={startQueue}>
            {hasActiveCall ? "In gesprek" : queueSessionId ? "In wachtrij" : "Start queue"}
          </button>
          <button className="btn btn-secondary" type="button" disabled={isBusy || !queueSessionId} onClick={leaveQueue}>
            Verlaat queue
          </button>
        </div>
      </div>

      <div className="card stack">
        <strong>Live match</strong>
        <div className="video-shell">
          <video ref={remoteVideoRef} autoPlay playsInline className="video-el" />
          {!hasActiveCall ? <div className="video-placeholder">Wachten op een live match…</div> : null}
        </div>
        <div className="stack" style={{ gap: 8 }}>
          <strong>{peerLabel}</strong>
          <span className="muted">{statusText}</span>
          {call?.peer?.profileId ? <a className="badge" href={`/discover/${call.peer.profileId}`}>Bekijk profiel</a> : null}
        </div>
        <div className="row">
          <button className="btn btn-secondary" type="button" disabled={!hasActiveCall || isBusy} onClick={() => postCallAction("next")}>Next</button>
          <button className="btn btn-primary" type="button" disabled={!hasActiveCall || isBusy} onClick={() => postCallAction("like")}>❤️ Like</button>
          <button className="btn btn-secondary" type="button" disabled={!hasActiveCall || isBusy} onClick={() => postCallAction("report")}>Report</button>
          <button className="btn btn-secondary" type="button" disabled={!hasActiveCall || isBusy} onClick={() => postCallAction("end")}>End</button>
        </div>
      </div>
    </div>
  );
}
