import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guards';
import { getQueueSessionStatus } from '@/lib/live/queue';

export async function GET(request: Request) {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ ok: false, error: 'sessionId is verplicht.' }, { status: 400 });
  }

  const result = await getQueueSessionStatus(sessionId, user.id);
  return NextResponse.json({ ok: true, ...result });
}
