import { prisma } from "@/lib/prisma/client";

export async function createVideoCall(callerUserId: string, calleeUserId: string) {
  return prisma.videoCall.create({
    data: {
      callerUserId,
      calleeUserId,
      signalingRoomKey: crypto.randomUUID()
    }
  });
}
