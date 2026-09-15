// dataEntrega representa uma data de calendário (sem horário relevante), sempre enviada como
// meia-noite UTC pelo <input type="date">. Formatamos em UTC para não "voltar" um dia em fusos
// horários negativos (ex: Brasil).
export function formatDataCurta(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

export function formatDataHora(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatSemana(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" }).format(
    date
  );
}

export function isVencida(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}

export function dateInputValue(iso: string): string {
  return iso.slice(0, 10);
}
