import { NextResponse } from "next/server";
import { requireOnboardingUser } from "@/lib/auth/guards";
import { sendChatMessage } from "@/lib/chat/sendMessage";

export async function POST(request: Request, context: { params: Promise<{ chatId: string }> }) {
  const user = await requireOnboardingUser();
  const { chatId } = await context.params;
  const formData = await request.formData();
  const body = String(formData.get("body") ?? "").trim();

  if (!body) {
    return NextResponse.redirect(new URL(`/chats/${chatId}?error=missing_message`, request.url));
  }

  const result = await sendChatMessage(chatId, user.id, body);
  if (!result.ok) {
    return NextResponse.redirect(new URL(`/chats/${chatId}?error=${result.error ?? "unknown"}`, request.url));
  }

  return NextResponse.redirect(new URL(`/chats/${chatId}?sent=1`, request.url));
}
