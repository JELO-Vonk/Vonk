import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

export async function createVideoCall(callerUserId: string, calleeUserId: string, tx?: Prisma.TransactionClient) {
  const client = tx ?? prisma;
  return client.videoCall.create({
    data: {
      callerUserId,
      calleeUserId,
      signalingRoomKey: crypto.randomUUID()
    }
  });
}
