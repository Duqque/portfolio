import * as THREE from "three";
import { keyframes, lerp, smoothstep, clamp } from "./math";

/** progress global → nombre de journées écoulées (+ offset matin). Le chapitre I finit au crépuscule/nuit. */
const dayKeys: [number, number][] = [[0, 0.08], [0.2, 2.8], [0.34, 4.55], [1, 5.3]];
export const phaseOf = (p: number) => keyframes(dayKeys, p);

const C = (h: string) => new THREE.Color(h);
const skyKeys: { u: number; top: THREE.Color; bot: THREE.Color }[] = [
  { u: 0.0, top: C("#8c9bd0"), bot: C("#ffc7a0") },
  { u: 0.08, top: C("#86b4ea"), bot: C("#e3eef6") },
  { u: 0.3, top: C("#6ea8ea"), bot: C("#d0e6f6") },
  { u: 0.5, top: C("#7bb0e6"), bot: C("#f1e6cf") },
  { u: 0.6, top: C("#6a5a9e"), bot: C("#ff9a68") },
  { u: 0.68, top: C("#2b2c5c"), bot: C("#b5587a") },
  { u: 0.76, top: C("#090c24"), bot: C("#1d2454") },
  { u: 0.94, top: C("#0a0e2a"), bot: C("#232b60") },
  { u: 1.0, top: C("#8c9bd0"), bot: C("#ffc7a0") },
];
const nightKeys: [number, number][] = [[0, 0.35], [0.06, 0], [0.55, 0], [0.64, 0.4], [0.72, 0.92], [0.78, 1], [0.94, 1], [1, 0.35]];

export const sky = {
  u: 0,
  night: 0,
  day: 1,
  top: new THREE.Color(),
  bottom: new THREE.Color(),
  sunDir: new THREE.Vector3(),
  sunColor: new THREE.Color(),
  sunInt: 1,
  moonDir: new THREE.Vector3(),
  moonInt: 0,
  hemiSky: new THREE.Color(),
  hemiGround: new THREE.Color(),
  hemiInt: 0.8,
};
const warm = C("#ff8f4f"), white = C("#fff4e0"), NIGHT_SKY = C("#6f86cc");

export function updateSky(p: number) {
  const phase = phaseOf(p);
  const u = ((phase % 1) + 1) % 1;
  sky.u = u;
  let i = 1;
  while (i < skyKeys.length - 1 && u > skyKeys[i].u) i++;
  const a = skyKeys[i - 1], b = skyKeys[i];
  const t = clamp((u - a.u) / (b.u - a.u));
  sky.top.copy(a.top).lerp(b.top, t);
  sky.bottom.copy(a.bot).lerp(b.bot, t);
  sky.night = keyframes(nightKeys, u);
  sky.day = 1 - sky.night;

  const ang = Math.PI * clamp(u / 0.64, 0, 1);
  const e = Math.sin(ang);
  sky.sunDir.set(-Math.cos(ang) * 62, Math.max(e, 0.04) * 56 + 3, -24);
  sky.sunColor.copy(warm).lerp(white, smoothstep(0.05, 0.5, e));
  sky.sunInt = u <= 0.64 ? 2.5 * smoothstep(0.0, 0.3, e) : 0;

  const am = Math.PI * clamp((u - 0.64) / 0.36, 0, 1);
  const em = Math.sin(am);
  sky.moonDir.set(-Math.cos(am) * 55, Math.max(em, 0.1) * 50 + 4, -30);
  sky.moonInt = u > 0.64 ? 1.5 * smoothstep(0.0, 0.2, em) : 0;

  sky.hemiSky.copy(sky.top).lerp(new THREE.Color("#ffffff"), 0.35 * sky.day).lerp(NIGHT_SKY, 0.8 * sky.night);
  sky.hemiGround.set("#6b6a5a").lerp(new THREE.Color("#3a4272"), sky.night);
  sky.hemiInt = lerp(0.7, 0.8, sky.night);
}
