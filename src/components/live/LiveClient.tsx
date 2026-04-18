'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type QueueResponse = {
  ok: boolean;
  session?: { id: string; status: string };
  call?: { id: string; signalingRoomKey: string } | null;
};

type StatusResponse = {
  ok: boolean;
  session?: { id: string; status: string } | null;
  call?: {
    id: string;
    callerUserId: string;
    calleeUserId: string;
    signalingRoomKey: string;
    caller?: { profile?: { displayName?: string | null; avatarUrl?: string | null } | null };
    callee?: { profile?: { displayName?: string | null; avatarUrl?: string | null } | null };
  } | null;
};

export function LiveClient() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [queueState, setQueueState] = useState<'idle' | 'waiting' | 'matched'>('idle');
  const [message, setMessage] = useState('Sta live paraat voor echte video-koppelingen.');
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!sessionId || queueState !== 'waiting') return;
    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/live/queue/status?sessionId=${encodeURIComponent(sessionId)}`, { cache: 'no-store' });
      const data = (await response.json()) as StatusResponse;
      if (data.call?.id) {
        setCallId(data.call.id);
        setQueueState('matched');
        setMessage('Er is een live match gevonden.');
        setPartnerName(data.call.caller?.profile?.displayName ?? data.call.callee?.profile?.displayName ?? 'Nieuwe match');
      }
    }, 2500);

    return () => window.clearInterval(timer);
  }, [queueState, sessionId]);

  const statusText = useMemo(() => {
    if (queueState === 'waiting') return 'Zoekt live match...';
    if (queueState === 'matched') return 'Live match actief';
    return 'Niet in queue';
  }, [queueState]);

  async function enableCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraEnabled(true);
      setMessage('Camera en microfoon zijn lokaal actief.');
    } catch {
      setError('Camera of microfoon kon niet gestart worden. Controleer browserrechten.');
    }
  }

  async function startQueue() {
    setError(null);
    const response = await fetch('/api/live/queue/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filters: { country: 'NL' } }),
    });
    const data = (await response.json()) as QueueResponse;
    if (!data.ok || !data.session?.id) {
      setError('Queue starten is mislukt.');
      return;
    }
    setSessionId(data.session.id);
    if (data.call?.id) {
      setCallId(data.call.id);
      setQueueState('matched');
      setMessage('Er is direct een live match gevonden.');
    } else {
      setQueueState('waiting');
      setMessage('Je staat nu in de live queue.');
    }
  }

  async function leaveQueue() {
    if (sessionId) {
      await fetch('/api/live/queue/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
    }
    if (callId) {
      await fetch(`/api/live/calls/${callId}/end`, { method: 'POST' });
    }
    setSessionId(null);
    setCallId(null);
    setQueueState('idle');
    setPartnerName(null);
    setMessage('Queue verlaten.');
  }

  async function act(action: 'like' | 'next' | 'report') {
    if (!callId) return;
    const endpoint = `/api/live/calls/${callId}/${action}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: action === 'report' ? JSON.stringify({ notes: 'Gemeld vanuit live client.' }) : undefined,
    });
    const data = await response.json();
    if (!response.ok || data.ok === false) {
      setError('Actie is mislukt.');
      return;
    }
    if (action === 'like') {
      setMessage('Like verstuurd. Als het wederzijds is, ontstaat direct een match.');
    } else if (action === 'report') {
      setMessage('Profiel gemeld en live call gesloten.');
      setQueueState('idle');
      setCallId(null);
    } else {
      setMessage('Volgende profiel gekozen. Start opnieuw voor een nieuwe match.');
      setQueueState('idle');
      setCallId(null);
    }
  }

  return (
    <div className="grid grid-2">
      <div className="card stack">
        <strong>Live status</strong>
        <div className="muted">{statusText}</div>
        <div className="muted">{message}</div>
        {partnerName ? <div className="muted">Tegenover je: {partnerName}</div> : null}
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <div className="row">
          <button className="btn btn-secondary" type="button" onClick={enableCamera}>
            {cameraEnabled ? 'Camera opnieuw starten' : 'Camera inschakelen'}
          </button>
          <button className="btn btn-primary" type="button" onClick={startQueue} disabled={queueState !== 'idle'}>
            Start queue
          </button>
          <button className="btn btn-secondary" type="button" onClick={leaveQueue} disabled={queueState === 'idle' && !callId}>
            Verlaat queue
          </button>
        </div>
      </div>

      <div className="card stack">
        <strong>Call viewport</strong>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: '100%', minHeight: 260, borderRadius: 16, background: '#0d1321', objectFit: 'cover' }}
        />
        <div className="row">
          <button className="btn btn-secondary" type="button" onClick={() => act('next')} disabled={!callId}>
            Next
          </button>
          <button className="btn btn-primary" type="button" onClick={() => act('like')} disabled={!callId}>
            ❤️ Like
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => act('report')} disabled={!callId}>
            Report
          </button>
        </div>
      </div>
    </div>
  );
}
