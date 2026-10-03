import * as THREE from "three";
import type { Part } from "./parts";
import { getSign, getTex } from "./textures";

/* Matériaux partagés (un par combinaison couleur/texture) → peu de draw-calls, mise à jour de la nuit en une passe. */
const cache = new Map<string, THREE.Material>();
const glowing: { mat: THREE.MeshStandardMaterial; base: number; gain: number }[] = [];

export const glass = new THREE.MeshStandardMaterial({
  color: "#a9cfe6", roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.32, depthWrite: false,
  emissive: new THREE.Color("#ffc878"), emissiveIntensity: 0,
});
glowing.push({ mat: glass, base: 0, gain: 0.9 });

function reg(m: THREE.MeshStandardMaterial, base: number, gain: number) { glowing.push({ mat: m, base, gain }); }

export function materialFor(p: Part): THREE.Material {
  const key = `${p.color}|${p.mat ?? "std"}|${p.tex ?? ""}|${p.sign ?? ""}|${p.emissive ?? ""}`;
  let m = cache.get(key);
  if (m) return m;
  const kind = p.mat ?? "std";
  if (kind === "glass") m = glass;
  else if (kind === "window") {
    const w = new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.2, metalness: 0.2, emissive: new THREE.Color("#ffc878"), emissiveIntensity: 0 });
    reg(w, 0, 1.4);
    m = w;
  } else if (kind === "emit") {
    const e = new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.5, emissive: new THREE.Color(p.emissive ?? p.color), emissiveIntensity: 0.35 });
    reg(e, 0.35, 1.5);
    m = e;
  } else if (kind === "sign") {
    const s = getSign(p.sign ?? "", "#7747FF");
    const sm = new THREE.MeshStandardMaterial({ map: s.map, emissiveMap: s.emissive ?? null, emissive: new THREE.Color("#ffffff"), emissiveIntensity: 0.05, roughness: 0.6 });
    reg(sm, 0.05, 0.9);
    m = sm;
  } else if (p.tex) {
    const t = getTex(p.tex);
    const rep = p.texRep ?? [1, 1];
    const mk = (tx: THREE.CanvasTexture | undefined) => {
      if (!tx) return null;
      const c = tx.clone(); c.needsUpdate = true; c.repeat.set(rep[0], rep[1]); c.wrapS = c.wrapT = THREE.RepeatWrapping; return c;
    };
    const sm = new THREE.MeshStandardMaterial({
      color: p.color, map: mk(t?.map), roughness: 0.85, flatShading: true,
      emissiveMap: mk(t?.emissive), emissive: new THREE.Color(t?.emissive ? "#ffffff" : "#000000"), emissiveIntensity: 0,
      transparent: !!t?.alpha, alphaTest: t?.alpha ? 0.4 : 0, side: t?.alpha ? THREE.DoubleSide : THREE.FrontSide,
    });
    if (t?.emissive) reg(sm, 0, 0.9);
    m = sm;
  } else {
    m = new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.82, metalness: 0.02, flatShading: true });
  }
  cache.set(key, m);
  return m;
}

/** Appelée une fois par frame : la nuit allume fenêtres, enseignes, écrans. */
export function updateGlow(night: number) {
  const k = Math.max(0, (night - 0.15) / 0.85);
  for (const g of glowing) g.mat.emissiveIntensity = g.base + g.gain * k;
}
