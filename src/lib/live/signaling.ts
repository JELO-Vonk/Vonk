type SignalKind = "offer" | "answer" | "candidate";

export type SignalEnvelope = {
  id: number;
  callId: string;
  senderUserId: string;
  kind: SignalKind;
  payload: unknown;
  createdAt: number;
};

type SignalStore = {
  nextId: number;
  byCallId: Map<string, SignalEnvelope[]>;
};

declare global {
  // eslint-disable-next-line no-var
  var __VONK_SIGNAL_STORE__: SignalStore | undefined;
}

function getStore(): SignalStore {
  if (!globalThis.__VONK_SIGNAL_STORE__) {
    globalThis.__VONK_SIGNAL_STORE__ = {
      nextId: 1,
      byCallId: new Map<string, SignalEnvelope[]>()
    };
  }
  return globalThis.__VONK_SIGNAL_STORE__;
}

export function publishSignal(callId: string, senderUserId: string, kind: SignalKind, payload: unknown) {
  const store = getStore();
  const entry: SignalEnvelope = {
    id: store.nextId++,
    callId,
    senderUserId,
    kind,
    payload,
    createdAt: Date.now()
  };
  const list = store.byCallId.get(callId) ?? [];
  list.push(entry);
  if (list.length > 200) {
    list.splice(0, list.length - 200);
  }
  store.byCallId.set(callId, list);
  return entry;
}

export function getSignalsSince(callId: string, sinceId = 0, excludeSenderUserId?: string) {
  const store = getStore();
  const list = store.byCallId.get(callId) ?? [];
  return list.filter((item) => item.id > sinceId && item.senderUserId !== excludeSenderUserId);
}

export function clearSignals(callId: string) {
  const store = getStore();
  store.byCallId.delete(callId);
}
