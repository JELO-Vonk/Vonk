import { NextResponse } from "next/server";

type Props = {
  params: Promise<{ callId: string }>;
};

export async function POST(_: Request, { params }: Props) {
  const { callId } = await params;
  return NextResponse.json({ ok: true, action: "like", callId });
}
