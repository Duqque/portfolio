import { clamp, invLerp } from "./math";
import type { BuildingDef } from "@/data/types";

/** Chaque étape occupe une fenêtre de la progression locale du bâtiment (0 → 1). */
export const STAGES = {
  foundation: [0.0, 0.14],
  structure: [0.12, 0.4],
  walls: [0.34, 0.62],
  roof: [0.6, 0.78],
  windows: [0.76, 0.88],
  sign: [0.86, 0.94],
  props: [0.9, 1.0],
} as const;
export type StageKey = keyof typeof STAGES;

/** 0 → 1 entre buildStart et buildEnd. Pure, donc parfaitement réversible. */
export function buildT(def: BuildingDef, p: number): number {
  const t = clamp(invLerp(def.buildStart, def.buildEnd, p));
  return def.status === "construction" ? Math.min(t, 0.6) : t;
}
export function stageT(stage: StageKey, bt: number): number {
  const [a, b] = STAGES[stage];
  const t = clamp((bt - a) / (b - a));
  return t * t * (3 - 2 * t);
}
export const isComplete = (def: BuildingDef, p: number) => def.status !== "construction" && p >= def.buildEnd;
