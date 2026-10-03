import type { RoadDef, TraceSegmentDef, TrainSchedule } from "./types";
import { buildings } from "./buildings";
import { rng, keyframes } from "@/engine/math";

/* ───────── Monde ───────── */
export const WORLD = { minX: -44, maxX: 52, minZ: -26, maxZ: 31 };
export const ISLAND_BOUNDS = { minX: -112, maxX: 96, minZ: -66, maxZ: 66 };
export const RAIL_Z = [-17.2, -19.8];
export const STREET_Z = 10;

/* ───────── Routes ───────── */
export const roads: RoadDef[] = [
  { id: "spur-jc", points: [[-23, 8.0], [-23, 10]], width: 1.2, start: 0.034, end: 0.04 },
  { id: "street-a", points: [[-31, 10], [-10, 10]], width: 3, start: 0.038, end: 0.054 },
  { id: "spur-lycee", points: [[-10, 7.6], [-10, 10]], width: 1.2, start: 0.074, end: 0.078 },
  { id: "street-b", points: [[-10, 10], [1, 10]], width: 3, start: 0.062, end: 0.08 },
  { id: "station-road", points: [[1, 10], [1, -6.6]], width: 2.4, start: 0.08, end: 0.094 },
  { id: "street-c", points: [[1, 10], [17, 10]], width: 3, start: 0.114, end: 0.128 },
  { id: "paris-link", points: [[17, 10], [17, -10.4]], width: 1.6, start: 0.128, end: 0.14 },
  { id: "spur-mjm", points: [[11, 7.6], [11, 10]], width: 1.2, start: 0.138, end: 0.141 },
  { id: "street-d", points: [[17, 10], [36, 10]], width: 3, start: 0.142, end: 0.166 },
  { id: "spur-cfa", points: [[22.5, 7.2], [22.5, 10]], width: 1.2, start: 0.158, end: 0.161 },
  { id: "spur-ff", points: [[22, 13.7], [22, 10]], width: 1.2, start: 0.16, end: 0.163 },
  { id: "spur-dojo", points: [[32, 8.5], [32, 10]], width: 1.2, start: 0.182, end: 0.186 },
  { id: "street-e", points: [[36, 10], [46, 8], [52, 4]], width: 3, start: 0.186, end: 0.198 },
  /* aperçu du futur */
  { id: "avenue-south", points: [[1, 10], [1, 31]], width: 3, start: 0.3, end: 0.4 },
  { id: "avenue-west", points: [[-31, 10], [-40, 10]], width: 3, start: 0.25, end: 0.272 },
  { id: "spur-jccmm", points: [[-35, 8.0], [-35, 10]], width: 1.2, start: 0.27, end: 0.274 },
  { id: "spur-jfp", points: [[-6, 13.2], [-6, 10]], width: 1.2, start: 0.222, end: 0.226 },
  { id: "spur-puc", points: [[-21, 14.2], [-21, 10]], width: 1.2, start: 0.246, end: 0.25 },
  { id: "spur-dome", points: [[40, 14.2], [40, 10]], width: 1.2, start: 0.308, end: 0.312 },
  { id: "avenue-hq", points: [[46, 8], [44, 8], [44, -1]], width: 2.6, start: 0.5, end: 0.6 },
  { id: "ring-south", points: [[-30, 22], [-3, 22], [12, 22], [38, 22]], width: 2.4, start: 0.6, end: 0.8 },
  { id: "north-link", points: [[-12, 10], [-12, -6]], width: 2, start: 0.7, end: 0.78 },
];

/** Point le plus à l'est de la rue principale déjà construit (pour les voitures et lampadaires). */
const mainStreet = roads.filter((r) => ["street-a", "street-b", "street-c", "street-d", "street-e", "avenue-west"].includes(r.id));
export function streetBuiltX(p: number): number {
  let x = -31;
  for (const r of mainStreet) {
    const t = Math.min(1, Math.max(0, (p - r.start) / (r.end - r.start)));
    if (t <= 0) continue;
    const x0 = r.points[0][0];
    const x1 = r.points[r.points.length - 1][0];
    x = Math.max(x, x0 + (x1 - x0) * t);
  }
  return Math.min(x, 52);
}
export function streetBuiltStart(p: number): number {
  return p > 0.038 ? -31 : 0;
}

/* ───────── Trace violette ───────── */
export const traceSegments: TraceSegmentDef[] = [
  { id: "jc-lycee", points: [[-23, 8.0], [-23, 9.6], [-10, 9.6], [-10, 7.6]], start: 0.036, end: 0.056 },
  { id: "lycee-gare", points: [[-10, 7.6], [-10, 9.6], [1.4, 9.6], [1.4, -6.4], [-6.2, -6.4], [-6.2, -13.4], [0, -13.4]], start: 0.082, end: 0.1 },
  { id: "gare-paris", points: [[0, -13.4], [17, -13.4], [17, -10.6]], start: 0.112, end: 0.132 },
  { id: "paris-mjm", points: [[17, -10.6], [17, 9.6], [11, 9.6], [11, 7.6]], start: 0.132, end: 0.145 },
  { id: "mjm-cfa", points: [[11, 7.6], [11, 9.6], [22.5, 9.6], [22.5, 7.2]], start: 0.148, end: 0.16 },
  { id: "mjm-ff", points: [[11, 9.6], [11, 10.6], [22, 10.6], [22, 13.7]], start: 0.15, end: 0.164 },
  { id: "cfa-dojo", points: [[22.5, 7.2], [22.5, 9.6], [32, 9.6], [32, 8.5]], start: 0.164, end: 0.178 },
  { id: "ff-dojo", points: [[22, 13.7], [22, 10.6], [31.4, 10.6], [31.4, 9.6]], start: 0.166, end: 0.178 },
  { id: "exit", points: [[32, 8.5], [32, 9.6], [38, 9.6], [45, 6.5, 0.6], [51, -8, 5], [56, -26, 14], [60, -44, 24]], start: 0.188, end: 0.2 },
  /* chapitre II */
  { id: "dojo-jfp", points: [[32, 10.6], [-6, 10.6], [-6, 13.2]], start: 0.206, end: 0.226 },
  { id: "jfp-puc", points: [[-6, 13.2], [-6, 11.2], [-21, 11.2], [-21, 14.2]], start: 0.232, end: 0.25 },
  { id: "puc-jccmm", points: [[-21, 14.2], [-21, 11.2], [-35, 11.2], [-35, 8.0]], start: 0.256, end: 0.274 },
  { id: "jccmm-dome", points: [[-35, 8.0], [-35, 11.8], [40, 11.8], [40, 14.2]], start: 0.282, end: 0.312 },
  /* réseau futur (Global Dojo Network) — mêmes mécaniques, autre teinte */
  { id: "net-1", kind: "network", points: [[-23, 8, 0.4], [-18, 4, 7], [-12, -4, 0.4]], start: 0.8, end: 0.84 },
  { id: "net-2", kind: "network", points: [[-23, 8, 0.4], [-9, 18, 9], [5, 22, 0.4]], start: 0.86, end: 0.9 },
  { id: "net-3", kind: "network", points: [[-23, 8, 0.4], [8, 22, 12], [38, 22, 0.4]], start: 0.88, end: 0.93 },
  { id: "net-4", kind: "network", points: [[-23, 8, 0.4], [-28, 16, 6], [-30, 20, 0.4]], start: 0.9, end: 0.94 },
];

/** Nœuds lumineux : apparaissent quand le bâtiment est terminé. */
export const traceNodes = ["jc-leforest", "lycee-gambetta", "gare", "paris", "mjm-webstart", "cfa-omnisport", "ffjudo", "dojo-paris", "judo-france-paris", "puc", "jccmm", "grand-dome"];

/* ───────── Trains ───────── */
export const trains: TrainSchedule[] = [
  { arrive: [0.088, 0.104], depart: [0.114, 0.134] },
  { arrive: [0.17, 0.182], depart: [0.192, 0.2] },
];
export const TRAIN_LEN = 15;
export function trainX(s: TrainSchedule, p: number): number | null {
  if (p <= s.arrive[0]) return null;
  if (p < s.arrive[1]) {
    const t = (p - s.arrive[0]) / (s.arrive[1] - s.arrive[0]);
    return -62 + 62 * (1 - Math.pow(1 - t, 3)) + 0.5;
  }
  if (p <= s.depart[0]) return 0.5;
  if (p < s.depart[1]) {
    const t = (p - s.depart[0]) / (s.depart[1] - s.depart[0]);
    return 0.5 + 76 * t * t * t;
  }
  return null; // reste hors-champ à l'est : ne revient pas
}
/** Activité sonore/visuelle du train (0..1) : fonction pure de p. */
export function trainSpeed(p: number): number {
  let v = 0;
  for (const s of trains) {
    const a = trainX(s, p);
    const b = trainX(s, p - 0.0015);
    if (a !== null && b !== null) v = Math.max(v, Math.min(1, Math.abs(a - b) / 1.6));
  }
  return v;
}

/* ───────── Marcheurs & voitures ───────── */
export interface WalkerDef { path: [number, number][]; speed: number; appearAt: number; color: string; bag?: boolean; offset: number }
export const walkers: WalkerDef[] = [
  { path: [[-29, 11.6], [-23.6, 11.6], [-23.6, 8.4]], speed: 1.1, appearAt: 0.02, color: "#e8e8ea", bag: true, offset: 0 },
  { path: [[-27, 11.8], [-22.4, 11.8], [-22.4, 8.4]], speed: 0.9, appearAt: 0.026, color: "#d85a5a", bag: true, offset: 0.4 },
  { path: [[-29, 8.2], [-25.5, 8.2]], speed: 0.5, appearAt: 0.03, color: "#6b7fa8", offset: 0.1 },
  { path: [[-25, 11.4], [-10, 11.4]], speed: 1.2, appearAt: 0.06, color: "#3d4c73", offset: 0.5 },
  { path: [[-12, 8.4], [-8, 8.4]], speed: 0.7, appearAt: 0.07, color: "#4a6fa5", offset: 0.2 },
  { path: [[-9, 8.6], [-12, 8.9]], speed: 0.6, appearAt: 0.07, color: "#c9a24a", offset: 0.7 },
  { path: [[-10, 11.5], [2.6, 11.5], [2.6, -6.2]], speed: 1.3, appearAt: 0.092, color: "#8a6bd1", bag: true, offset: 0.3 },
  { path: [[-0.2, 8], [-0.2, -6.2]], speed: 1.0, appearAt: 0.096, color: "#2f3340", bag: true, offset: 0.1 },
  { path: [[3, 11.4], [16, 11.4]], speed: 1.2, appearAt: 0.126, color: "#e0457b", offset: 0.2 },
  { path: [[9, 8.6], [13, 8.6]], speed: 0.7, appearAt: 0.136, color: "#35b6d6", offset: 0.3 },
  { path: [[18, 11.4], [34, 11.4]], speed: 1.1, appearAt: 0.15, color: "#f2c230", offset: 0.6 },
  { path: [[20, 8.4], [25, 8.4]], speed: 0.6, appearAt: 0.16, color: "#2f4c8a", offset: 0.1 },
  { path: [[28, 9], [36, 9]], speed: 0.9, appearAt: 0.18, color: "#c1272d", offset: 0.5 },
  { path: [[30, 11.4], [44, 8.6]], speed: 1.1, appearAt: 0.19, color: "#e8e8ea", offset: 0.8 },
  /* ville « aujourd'hui » */
  { path: [[-6, 12], [-6, 30]], speed: 1.2, appearAt: 0.4, color: "#6b7fa8", offset: 0 },
  { path: [[2.6, 12], [2.6, 30]], speed: 1.0, appearAt: 0.42, color: "#d85a5a", offset: 0.5 },
  { path: [[10, 21], [34, 21]], speed: 1.2, appearAt: 0.7, color: "#e8e8ea", offset: 0.3 },
  { path: [[-28, 21], [-4, 21]], speed: 1.1, appearAt: 0.75, color: "#c9a24a", offset: 0.2 },
  { path: [[45, 9], [45, -1]], speed: 0.9, appearAt: 0.8, color: "#7747FF", offset: 0.4 },
];
export interface CarDef { dir: 1 | -1; lane: number; speed: number; color: string; offset: number; appearAt: number }
export const cars: CarDef[] = [
  { dir: 1, lane: 9.1, speed: 3.2, color: "#9aa7b8", offset: 0.0, appearAt: 0.055 },
  { dir: -1, lane: 10.9, speed: 2.8, color: "#c9703b", offset: 0.4, appearAt: 0.085 },
  { dir: 1, lane: 9.1, speed: 3.6, color: "#2f4c8a", offset: 0.7, appearAt: 0.12 },
  { dir: -1, lane: 10.9, speed: 3.0, color: "#e8e8ea", offset: 0.2, appearAt: 0.145 },
  { dir: 1, lane: 9.1, speed: 3.4, color: "#c1272d", offset: 0.55, appearAt: 0.17 },
  { dir: -1, lane: 10.9, speed: 3.1, color: "#4b5563", offset: 0.9, appearAt: 0.19 },
];

/* ───────── Nature ───────── */
export const POND = { x: -36, z: -10, rx: 5.5, rz: 3.4 };

export interface TreeDef { x: number; z: number; s: number; appearAt: number; tone: number }
function blocked(x: number, z: number): boolean {
  for (const b of buildings) {
    const [w, d] = b.size;
    const m = b.archetype === "station" ? 5 : b.archetype === "cfa" ? 4 : 2.6;
    const cx = b.position[0], cz = b.position[2];
    const rot = Math.abs((b.rotationY ?? 0) % Math.PI) > 1;
    const hw = (rot ? d : w) / 2 + m, hd = (rot ? w : d) / 2 + m;
    if (Math.abs(x - cx) < hw && Math.abs(z - cz) < hd) return true;
  }
  if (z > RAIL_Z[0] - 3 && z < RAIL_Z[1] + 3 && Math.abs(z + 18.5) < 5.5) return true;
  if (Math.abs(z - STREET_Z) < 4 && x > -34 && x < 54) return true;
  for (const r of roads) for (let i = 0; i < r.points.length - 1; i++) {
    const [ax, az] = r.points[i], [bx, bz] = r.points[i + 1];
    const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
    if (Math.hypot(x - (ax + dx * t), z - (az + dz * t)) < r.width / 2 + 1.4) return true;
  }
  if (((x - POND.x) / (POND.rx + 1.5)) ** 2 + ((z - POND.z) / (POND.rz + 1.5)) ** 2 < 1) return true;
  if (Math.abs(x - 17) < 2 && z > -12 && z < 11) return true;
  return false;
}
export function makeTrees(): TreeDef[] {
  const r = rng(2024);
  const out: TreeDef[] = [];
  let guard = 0;
  while (out.length < 150 && guard++ < 6000) {
    const x = WORLD.minX + 2 + r() * (WORLD.maxX - WORLD.minX - 4);
    const z = WORLD.minZ + 2 + r() * (WORLD.maxZ - WORLD.minZ - 4);
    if (blocked(x, z)) continue;
    const i = out.length;
    // les ~34 premiers arbres sont là dès le terrain vide ; les autres poussent avec la ville
    const base = i < 34;
    const appearAt = base ? -1 : 0.01 + r() * 0.9;
    out.push({ x, z, s: 0.8 + r() * 0.8, appearAt, tone: r() });
  }
  return out;
}

export interface LampDef { x: number; z: number; ry: number }
export function makeLamps(): LampDef[] {
  const out: LampDef[] = [];
  for (let x = -28; x <= 44; x += 6.5) out.push({ x, z: STREET_Z - 1.9 - (x > 34 ? (x - 34) * 0.2 : 0), ry: 0 });
  for (let z = -4; z <= 8; z += 6) out.push({ x: 2.9, z, ry: 0 });
  return out;
}
export const lampAppearX = (l: LampDef) => l.x;
export { keyframes };
