import type { NivelDificuldade } from "../types";

export const NIVEL_LABELS: Record<NivelDificuldade, string> = {
  BAIXO: "Baixo",
  MEDIO: "Médio",
  ALTO: "Alto",
};

export const NIVEL_OPTIONS: NivelDificuldade[] = ["BAIXO", "MEDIO", "ALTO"];

export const NIVEL_TONES: Record<NivelDificuldade, "leaf" | "sun" | "coral"> = {
  BAIXO: "leaf",
  MEDIO: "sun",
  ALTO: "coral",
};
