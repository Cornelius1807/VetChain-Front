export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function toHM(date: Date): string {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function parseHM(hm: string): { h: number; m: number } {
  const [h, m] = hm.split(":").map(Number);
  return { h, m };
}

export function addMinutes(d: Date, minutes: number): Date {
  return new Date(d.getTime() + minutes * 60000);
}

export function generateDailySlots(
  day: Date,
  startHM: string,
  endHM: string,
  intervalMinutes = 30
): Date[] {
  const { h: sh, m: sm } = parseHM(startHM);
  const { h: eh, m: em } = parseHM(endHM);
  const start = new Date(day);
  start.setHours(sh, sm, 0, 0);
  const end = new Date(day);
  end.setHours(eh, em, 0, 0);
  const out: Date[] = [];
  for (let cur = new Date(start); cur < end; cur = addMinutes(cur, intervalMinutes)) {
    out.push(new Date(cur));
  }
  return out;
}

export function startOfWeek(any: Date): Date {
  const d = new Date(any);
  const day = d.getDay(); // 0 Sunday
  const diff = (day + 6) % 7; // make Monday start
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function nextDays(from: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    return d;
  });
}

