import * as THREE from "three";
import { rng } from "@/engine/math";

/* Textures 100 % procédurales (canvas) : aucun asset externe requis pour le prototype.
   Chaque entrée peut fournir une carte d'émission (fenêtres éclairées la nuit). */

interface TexSet { map: THREE.CanvasTexture; emissive?: THREE.CanvasTexture; alpha?: boolean }
const cache = new Map<string, TexSet>();

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return [c, c.getContext("2d")!] as const;
}
function tex(c: HTMLCanvasElement, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const makers: Record<string, () => TexSet> = {
  brick() {
    const [c, g] = canvas(256, 256);
    g.fillStyle = "#d9cdbd"; g.fillRect(0, 0, 256, 256);
    const r = rng(3);
    const rows = 16, bw = 32, bh = 256 / rows;
    for (let y = 0; y < rows; y++) for (let x = -1; x < 9; x++) {
      const ox = (y % 2) * (bw / 2);
      const l = 40 + r() * 8;
      g.fillStyle = `hsl(${10 + r() * 6}, ${52 + r() * 8}%, ${l}%)`;
      g.fillRect(x * bw + ox + 1.5, y * bh + 1.5, bw - 3, bh - 3);
    }
    return { map: tex(c) };
  },
  tatami() {
    const [c, g] = canvas(256, 256);
    g.fillStyle = "#6f8a4b"; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      g.fillStyle = (i + j) % 2 ? "#a7bd7c" : "#9bb673";
      g.fillRect(i * 128 + 4, j * 128 + 4, 120, 120);
      g.strokeStyle = "rgba(60,80,40,.25)"; g.lineWidth = 1;
      for (let k = 0; k < 14; k++) { g.beginPath(); g.moveTo(i * 128 + 4, j * 128 + 8 + k * 8); g.lineTo(i * 128 + 124, j * 128 + 8 + k * 8); g.stroke(); }
    }
    return { map: tex(c) };
  },
  ribbon() {
    const [c, g] = canvas(256, 128);
    const [e, ge] = canvas(256, 128);
    g.fillStyle = "#f1eee8"; g.fillRect(0, 0, 256, 128);
    ge.fillStyle = "#000"; ge.fillRect(0, 0, 256, 128);
    for (let i = 0; i < 2; i++) {
      const x = i * 128 + 8;
      g.fillStyle = "#6f87a0"; g.fillRect(x, 40, 112, 44);
      g.fillStyle = "#8f2227";
      for (let k = 0; k <= 3; k++) g.fillRect(x + k * 37 - 1, 38, 4, 48);
      g.fillRect(x, 38, 112, 3); g.fillRect(x, 83, 112, 3);
      ge.fillStyle = "#ffcf85"; ge.fillRect(x, 42, 112, 40);
    }
    return { map: tex(c), emissive: tex(e) };
  },
  typo() {
    const [c, g] = canvas(1024, 512);
    const [e, ge] = canvas(1024, 512);
    g.fillStyle = "#d4d8da"; g.fillRect(0, 0, 1024, 512);
    ge.fillStyle = "#000"; ge.fillRect(0, 0, 1024, 512);
    const words = ["POUR", "DES", "LYCÉE", "TOURCOING", "GAMBETTA", "ÉLÈVES", "TERMINALE", "LILLE", "ENCLASSE", "UNIVERSITÉS", "FÉVRIER", "DANS", "SUR", "VENDREDI", "INFORMATION"];
    const r = rng(11);
    const rows = [92, 72, 96, 64, 88, 60];
    let y = 0;
    rows.forEach((h) => {
      let x = -10;
      while (x < 1024) {
        const wd = words[Math.floor(r() * words.length)];
        g.font = `900 ${h}px Impact, "Arial Narrow", sans-serif`;
        ge.font = g.font;
        g.fillStyle = "#5d6368"; g.fillText(wd, x, y + h * 0.88);
        ge.fillStyle = "#ffb862"; ge.fillText(wd, x, y + h * 0.88);
        x += g.measureText(wd).width + 22;
      }
      y += h * 0.86;
    });
    // fines lignes de panneaux
    g.strokeStyle = "rgba(60,65,70,.45)"; g.lineWidth = 2;
    for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(0, i * 64); g.lineTo(1024, i * 64); g.stroke(); }
    return { map: tex(c), emissive: tex(e) };
  },
  louvre() {
    const [c, g] = canvas(256, 256);
    g.fillStyle = "#8e8f90"; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 4; j++) {
      const x0 = i * 128 + 6, y0 = j * 64 + 5, w = 116, h = 54;
      g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
      g.fillStyle = "#f2f2f0"; g.fillRect(x0, y0, w, h);
      g.fillStyle = "#17181a";
      const dir = (i + j) % 2 ? 1 : -1;
      for (let k = -12; k < 24; k++) {
        g.beginPath();
        g.moveTo(x0 + k * 10, dir > 0 ? y0 : y0 + h);
        g.lineTo(x0 + k * 10 + 5, dir > 0 ? y0 : y0 + h);
        g.lineTo(x0 + k * 10 + 5 + dir * h * 0.9, dir > 0 ? y0 + h : y0);
        g.lineTo(x0 + k * 10 + dir * h * 0.9, dir > 0 ? y0 + h : y0);
        g.fill();
      }
      g.restore();
    }
    return { map: tex(c) };
  },
  stone() {
    const [c, g] = canvas(256, 256);
    g.fillStyle = "#cdb592"; g.fillRect(0, 0, 256, 256);
    const r = rng(5);
    for (let y = 0; y < 16; y++) {
      g.fillStyle = `rgba(90,70,40,${0.18 + r() * 0.08})`; g.fillRect(0, y * 16, 256, 1.5);
      for (let x = 0; x < 6; x++) g.fillRect(x * 44 + ((y % 2) * 22), y * 16, 1.5, 16);
    }
    return { map: tex(c) };
  },
  concrete() {
    const [c, g] = canvas(256, 256);
    g.fillStyle = "#bdbbb4"; g.fillRect(0, 0, 256, 256);
    const r = rng(9);
    for (let i = 0; i < 8; i++) { g.fillStyle = `rgba(80,80,75,${0.06 + r() * 0.06})`; g.fillRect(0, i * 32, 256, 3); }
    for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(70,70,65,${r() * 0.08})`; g.fillRect(r() * 256, r() * 256, 2, 2); }
    return { map: tex(c) };
  },
  curtain() {
    const [c, g] = canvas(256, 256);
    const [e, ge] = canvas(256, 256);
    g.fillStyle = "#2a3246"; g.fillRect(0, 0, 256, 256);
    ge.fillStyle = "#000"; ge.fillRect(0, 0, 256, 256);
    const r = rng(21);
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
      g.fillStyle = "#7f9bbd"; g.fillRect(i * 32 + 3, j * 32 + 4, 26, 24);
      if (r() > 0.45) { ge.fillStyle = r() > 0.5 ? "#ffd48f" : "#bcd8ff"; ge.fillRect(i * 32 + 3, j * 32 + 4, 26, 24); }
    }
    return { map: tex(c), emissive: tex(e) };
  },
  lattice() {
    const [c, g] = canvas(128, 128);
    g.clearRect(0, 0, 128, 128);
    g.strokeStyle = "#4b4f57"; g.lineWidth = 7;
    g.strokeRect(2, 2, 124, 124);
    g.lineWidth = 5;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(128, 128); g.moveTo(128, 0); g.lineTo(0, 128); g.stroke();
    return { map: tex(c), alpha: true };
  },
};

export function getTex(name: string): TexSet | null {
  if (typeof document === "undefined") return null;
  let t = cache.get(name);
  if (!t && makers[name]) { t = makers[name](); cache.set(name, t); }
  return t ?? null;
}

/* Enseignes : texte sur plaque sombre, avec carte d'émission pour la nuit. */
const signCache = new Map<string, TexSet>();
export function getSign(text: string, tint = "#7747FF"): TexSet {
  const key = text + tint;
  const hit = signCache.get(key);
  if (hit) return hit;
  const [c, g] = canvas(512, 128);
  const [e, ge] = canvas(512, 128);
  if (text === "@clock") {
    const [c2, g2] = canvas(128, 128);
    g2.fillStyle = "#f5f2ea"; g2.fillRect(0, 0, 128, 128);
    g2.strokeStyle = "#2a2a2a"; g2.lineWidth = 8; g2.beginPath(); g2.arc(64, 64, 52, 0, 7); g2.stroke();
    g2.lineWidth = 6; g2.beginPath(); g2.moveTo(64, 64); g2.lineTo(64, 26); g2.moveTo(64, 64); g2.lineTo(92, 74); g2.stroke();
    const out = { map: tex(c2), emissive: tex(c2) };
    signCache.set(key, out);
    return out;
  }
  g.fillStyle = "#14161f"; g.fillRect(0, 0, 512, 128);
  g.strokeStyle = tint; g.lineWidth = 6; g.strokeRect(5, 5, 502, 118);
  ge.fillStyle = "#000"; ge.fillRect(0, 0, 512, 128);
  const lines = text.split("\n");
  const size = lines.length > 1 ? 44 : text.length > 14 ? 52 : 68;
  [g, ge].forEach((ctx, k) => {
    ctx.fillStyle = k === 0 ? "#f4efe6" : "#ffe9c2";
    ctx.font = `800 ${size}px "Helvetica Neue", Arial, sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    lines.forEach((ln, i) => ctx.fillText(ln, 256, 64 + (i - (lines.length - 1) / 2) * (size + 6), 480));
  });
  const out = { map: tex(c), emissive: tex(e) };
  signCache.set(key, out);
  return out;
}

export function glowSprite() {
  const [c, g] = canvas(64, 64);
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,255,.35)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return tex(c);
}
