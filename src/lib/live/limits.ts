export function canUseVideoConnects(used: number, limit: number) {
  return Number.isFinite(limit) ? used < limit : true;
}
