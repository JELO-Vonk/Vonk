export function assertSafeMediaUrl(url: string) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid media URL");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Unsupported media protocol");
  }

  if (!parsed.hostname) {
    throw new Error("Missing media host");
  }

  return true;
}
