// Retorna a segunda-feira (00:00 UTC) da semana em que a data cai.
export function weekStart(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay(); // 0 (dom) .. 6 (sáb)
  const diff = (day === 0 ? -6 : 1) - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

export function isoDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}
