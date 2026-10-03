import type { StageKey } from "@/engine/construction";

export type Shape = "box" | "cyl" | "cone" | "pyr" | "sphere" | "prism" | "dome";
export type MatKind = "std" | "window" | "glass" | "sign" | "emit";

export interface Part {
  shape: Shape;
  /** pos = centre du bas de la pièce (x, y du dessous, z) */
  pos: [number, number, number];
  size: [number, number, number];
  color: string;
  stage: StageKey;
  mat?: MatKind;
  rotY?: number;
  rotX?: number;
  rotZ?: number;
  grow?: "y" | "all";
  sign?: string;
  /** nom d'une texture procédurale (voir textures.ts) + répétition */
  tex?: string;
  texRep?: [number, number];
  emissive?: string;
  /** retarde/compresse l'apparition dans l'étape */
  delay?: number;
}

export interface ArchetypeOut {
  parts: Part[];
}

type Opt = Partial<Omit<Part, "shape" | "pos" | "size" | "color" | "stage">>;
export const box = (x: number, y: number, z: number, w: number, h: number, d: number, color: string, stage: StageKey, o: Opt = {}): Part =>
  ({ shape: "box", pos: [x, y, z], size: [w, h, d], color, stage, ...o });
export const cyl = (x: number, y: number, z: number, dia: number, h: number, color: string, stage: StageKey, o: Opt = {}): Part =>
  ({ shape: "cyl", pos: [x, y, z], size: [dia, h, dia], color, stage, ...o });
export const prism = (x: number, y: number, z: number, len: number, h: number, depth: number, color: string, stage: StageKey, o: Opt = {}): Part =>
  ({ shape: "prism", pos: [x, y, z], size: [len, h, depth], color, stage, ...o });
export const pyr = (x: number, y: number, z: number, w: number, h: number, d: number, color: string, stage: StageKey, o: Opt = {}): Part =>
  ({ shape: "pyr", pos: [x, y, z], size: [w, h, d], color, stage, ...o });
export const dome = (x: number, y: number, z: number, w: number, h: number, d: number, color: string, stage: StageKey, o: Opt = {}): Part =>
  ({ shape: "dome", pos: [x, y, z], size: [w, h, d], color, stage, ...o });
export const sphere = (x: number, y: number, z: number, dia: number, color: string, stage: StageKey, o: Opt = {}): Part =>
  ({ shape: "sphere", pos: [x, y, z], size: [dia, dia, dia], color, stage, ...o });

/** Petit personnage stylisé : corps + tête (+ ceinture). */
export function person(x: number, y: number, z: number, color: string, o: { belt?: string; head?: string; s?: number; stage?: StageKey } = {}): Part[] {
  const s = o.s ?? 1, st = o.stage ?? "props";
  const out: Part[] = [
    cyl(x, y, z, 0.3 * s, 0.46 * s, color, st, { grow: "all" }),
    sphere(x, y + 0.46 * s, z, 0.24 * s, o.head ?? "#e6b894", st, { grow: "all" }),
  ];
  if (o.belt) out.push(cyl(x, y + 0.2 * s, z, 0.33 * s, 0.07 * s, o.belt, st, { grow: "all" }));
  return out;
}

/** Les 4 bords d'un cadre d'ouvertures sur une face : fenêtres régulières. */
export function windowGrid(
  face: "front" | "back" | "left" | "right",
  w: number, d: number, y0: number, rows: number, cols: number, ww: number, wh: number, gapY: number,
  stage: StageKey = "windows", mat: MatKind = "window", color = "#bcd6ec",
): Part[] {
  const out: Part[] = [];
  const along = face === "front" || face === "back" ? w : d;
  const step = along / cols;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const u = -along / 2 + step * (c + 0.5);
      const y = y0 + r * gapY;
      const t = 0.07;
      if (face === "front") out.push(box(u, y, d / 2 + t / 2 - 0.02, ww, wh, t, color, stage, { mat, grow: "all" }));
      if (face === "back") out.push(box(u, y, -d / 2 - t / 2 + 0.02, ww, wh, t, color, stage, { mat, grow: "all" }));
      if (face === "right") out.push(box(w / 2 + t / 2 - 0.02, y, u, t, wh, ww, color, stage, { mat, grow: "all" }));
      if (face === "left") out.push(box(-w / 2 - t / 2 + 0.02, y, u, t, wh, ww, color, stage, { mat, grow: "all" }));
    }
  return out;
}
