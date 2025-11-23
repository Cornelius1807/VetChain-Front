export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-expect-error randomUUID may not exist in older lib definitions
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
