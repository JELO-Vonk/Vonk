const URL_REGEX = /(https?:\/\/|www\.)/i;

export function looksLikeSpam(message: string) {
  if (message.length > 1500) return true;
  if (URL_REGEX.test(message)) return true;
  const repeated = /(.)\1{7,}/.test(message);
  return repeated;
}
