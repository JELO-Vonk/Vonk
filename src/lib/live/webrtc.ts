export type IceServerConfig = { urls: string | string[]; username?: string; credential?: string };

function parseList(value: string | undefined) {
  return (value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
}

export function getIceServers(): IceServerConfig[] {
  const stunServers = parseList(process.env.NEXT_PUBLIC_STUN_URLS || "stun:stun.l.google.com:19302");
  const turnServers = parseList(process.env.NEXT_PUBLIC_TURN_URLS);
  const servers: IceServerConfig[] = [];

  if (stunServers.length) servers.push({ urls: stunServers });
  if (turnServers.length) {
    servers.push({
      urls: turnServers,
      username: process.env.TURN_USERNAME || undefined,
      credential: process.env.TURN_CREDENTIAL || undefined
    });
  }

  return servers;
}
