import type { BuildingDef } from "@/data/types";
import { box, cyl, prism, pyr, dome, sphere, person, windowGrid, type Part } from "../parts";

type Gen = (def: BuildingDef) => Part[];
const WHITE_GI = "#f4f2ee";

/* ───────────────────────── JC LEFOREST — d'après la photo : brique rouge, acrotère blanc, volume en bardage blanc, lanterneaux ───────────────────────── */
const dojo: Gen = (def) => {
  const [w, d] = def.size;
  const brick = def.tint ?? "#ffffff";
  const P: Part[] = [];
  const mW = w * 0.62, wW = w - mW;
  const mx = -w / 2 + mW / 2, wx = w / 2 - wW / 2;
  const Hm = 2.5, Hw = 2.1, wd = d * 0.82, wz = -(d - wd) / 2;
  const B = (x: number, y: number, z: number, bw: number, bh: number, bd: number, st: "walls" | "roof" = "walls") =>
    box(x, y, z, bw, bh, bd, brick, st, { tex: "brick", texRep: [Math.max(bw, bd) / 2.2, bh / 1.1] });
  // fondation + sol de tatamis
  P.push(box(0, 0, 0.6, w + 1.6, 0.25, d + 2.2, "#b8b1a4", "foundation"));
  P.push(box(mx, 0.25, 0, mW - 0.4, 0.05, d - 0.4, "#ffffff", "foundation", { tex: "tatami", texRep: [2.4, 2.2] }));
  // bloc principal (creux : on voit le tatami par la vitre) : fond, gauche
  P.push(B(mx, 0.25, -d / 2 + 0.11, mW, Hm, 0.22), B(-w / 2 + 0.11, 0.25, 0, 0.22, Hm, d));
  for (const [x, z] of [[-w / 2, -d / 2], [-w / 2, d / 2], [mx + mW / 2, d / 2], [mx + mW / 2, -d / 2]] as [number, number][]) P.push(box(x, 0.3, z, 0.2, Hm - 0.1, 0.2, "#6e5842", "structure"));
  // façade : pan gauche, fenêtre vitrée (tatamis visibles), trumeau, porte rouge dans cadre blanc
  const fz = d / 2 - 0.11, wl = -w / 2;
  P.push(B(wl + 0.3, 0.25, fz, 0.6, Hm, 0.22));
  P.push(B(wl + 1.95, 0.25, fz, 1.0 + 0.0, 0.8, 0.22), B(wl + 1.95, 1.95, fz, 1.0, Hm - 1.7, 0.22));
  P.push(box(wl + 1.95, 1.05, fz, 1.0, 0.9, 0.06, "#bcd8ec", "windows", { mat: "glass" }));
  P.push(B(wl + 2.75, 0.25, fz, 0.6, Hm, 0.22));
  const dx = wl + 3.55;
  P.push(box(dx - 0.28, 0.3, fz + 0.1, 0.5, 1.8, 0.06, "#9b2227", "windows"), box(dx + 0.28, 0.3, fz + 0.1, 0.5, 1.8, 0.06, "#9b2227", "windows"));
  P.push(box(dx - 0.28, 0.9, fz + 0.14, 0.4, 0.7, 0.03, "#bcd8ec", "windows", { mat: "glass" }), box(dx + 0.28, 0.9, fz + 0.14, 0.4, 0.7, 0.03, "#bcd8ec", "windows", { mat: "glass" }));
  P.push(box(dx - 0.66, 0.25, fz + 0.08, 0.1, 2.1, 0.16, "#f4f1ea", "walls"), box(dx + 0.66, 0.25, fz + 0.08, 0.1, 2.1, 0.16, "#f4f1ea", "walls"), box(dx, 2.3, fz + 0.08, 1.42, 0.1, 0.16, "#f4f1ea", "walls"));
  P.push(B(dx + 1.1, 0.25, fz, 0.44, Hm, 0.22));
  // aile basse (briques) : porte rouge latérale, baie
  P.push(B(wx, 0.25, wz, wW, Hw, wd));
  P.push(box(wx + 0.3, 0.25, wz + wd / 2 + 0.04, 0.6, 1.45, 0.06, "#8f2227", "windows"));
  P.push(box(wx - 0.5, 0.9, wz + wd / 2 + 0.03, 0.6, 0.6, 0.05, "#7a8794", "windows", { mat: "glass" }));
  // toitures-terrasses + acrotères blancs
  const roof = (cx: number, cz: number, rw: number, rd: number, y: number) => {
    P.push(box(cx, y, cz, rw + 0.1, 0.16, rd + 0.1, "#8c8880", "roof"));
    const t = 0.16, h = 0.3, c = "#f4f1ea";
    P.push(box(cx, y + 0.16, cz + rd / 2, rw + 0.3, h, t, c, "roof"), box(cx, y + 0.16, cz - rd / 2, rw + 0.3, h, t, c, "roof"),
      box(cx + rw / 2, y + 0.16, cz, t, h, rd + 0.1, c, "roof"), box(cx - rw / 2, y + 0.16, cz, t, h, rd + 0.1, c, "roof"));
  };
  roof(mx, 0, mW, d, 0.25 + Hm);
  roof(wx, wz, wW, wd, 0.25 + Hw);
  // lanterneaux et groupes de ventilation
  const sky = (x: number, z: number, y: number) => P.push(box(x, y, z, 0.5, 0.14, 0.5, "#e9e6df", "roof"), box(x, y + 0.14, z, 0.36, 0.03, 0.36, "#bcd8ec", "roof", { mat: "glass" }));
  for (const [i, j] of [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2]] as [number, number][]) sky(wx - 0.7 + i * 0.7, wz - wd / 2 + 0.7 + j * 0.8, 0.25 + Hw + 0.16);
  for (const [x, z] of [[mx + 0.6, d / 2 - 0.7], [mx + 1.3, d / 2 - 1.4], [mx - 0.2, d / 2 - 0.8]] as [number, number][]) sky(x, z, 0.25 + Hm + 0.16);
  P.push(box(wx + 0.5, 0.25 + Hw + 0.16, wz + 0.2, 0.55, 0.5, 0.45, "#e8e6e0", "roof"), box(wx - 0.3, 0.25 + Hw + 0.16, wz + 0.9, 0.4, 0.3, 0.4, "#9a9690", "roof"));
  // volume surélevé en bardage blanc à bandeaux vitrés rouges
  const uy = 0.25 + Hm + 0.16;
  P.push(box(mx, uy, -d * 0.2, mW - 0.2, 1.15, d * 0.55, "#ffffff", "roof", { tex: "ribbon", texRep: [(mW - 0.2) / 2.2, 1] }));
  P.push(box(mx, uy + 1.15, -d * 0.2, mW + 0.05, 0.13, d * 0.55 + 0.25, "#f4f1ea", "roof"));
  // enseigne au-dessus de l'entrée
  P.push(box(dx, 2.42, fz + 0.14, 2.0, 0.4, 0.07, "#ffffff", "sign", { mat: "sign", sign: def.sign ?? "DOJO" }));
  // vie : judokas sur le tatami, parents et sacs à l'entrée
  const kid = ["#7747FF", "#e0c040", "#d85a5a", "#4a8fd0", "#ffffff", "#e08a3a"];
  [[-2.6, -0.6], [-1.6, -1.1], [-0.4, -0.8], [0.4, -0.2], [-2.2, 0.5], [-1.0, 0.6]].forEach(([x, z], i) => P.push(...person(x, 0.3, z, WHITE_GI, { belt: kid[i], s: 0.85 })));
  P.push(...person(0.1, 0.3, -1.3, "#2f3340", { s: 1 }));
  [[dx - 1.1, d / 2 + 1.0, "#8a6bd1"], [dx + 0.7, d / 2 + 1.2, "#d9a066"], [dx + 1.5, d / 2 + 0.8, "#4a6fa5"]].forEach(([x, z, c]) => P.push(...person(x as number, 0.25, z as number, c as string)));
  P.push(box(dx - 1.5, 0.25, d / 2 + 1.0, 0.5, 0.3, 0.3, "#2f3340", "props"));
  return P;
};

/* ───────────────────────── LYCÉE GAMBETTA — volume en porte-à-faux, façade perforée typographique ───────────────────────── */
const school: Gen = (def) => {
  const [w, d, h] = def.size;
  const P: Part[] = [];
  P.push(box(0, 0, 0.8, w + 1.8, 0.2, d + 2.6, "#b7b2a8", "foundation"));
  P.push(box(0, 0.2, 0, w * 0.78, 0.06, d * 0.8, "#d9d6cf", "foundation"));
  // rez-de-chaussée vitré
  const gh = 2.1;
  const gw = w - 4.6;
  P.push(box(0.1, 0.26, 0, gw, gh, d * 0.8, "#a9cfe6", "windows", { mat: "glass" }));
  for (let i = -6; i <= 6; i++) P.push(box(0.1 + i * gw / 12, 0.26, d * 0.4, 0.06, gh, 0.06, "#3d4046", "structure"));
  // noyau béton à droite, volume en porte-à-faux à gauche
  P.push(box(w / 2 - 1.1, 0.2, 0, 2.2, gh + 0.1, d * 0.8, "#ffffff", "walls", { tex: "concrete", texRep: [1, 1] }));
  // volume supérieur perforé
  const uy = 0.26 + gh, uh = h - gh - 0.5;
  P.push(box(0, uy, 0, w, uh, d, "#ffffff", "walls", { tex: "typo", texRep: [1, 1], mat: "std" }));
  P.push(cyl(w / 2 - 0.5 - 0.0, uy, d / 2 - 0.35, 0.7, uh, "#c8ccce", "walls")); // angle arrondi
  P.push(box(0, uy + uh, 0, w + 0.1, 0.16, d + 0.1, "#8f9498", "roof"));
  P.push(box(-w * 0.2, uy + uh + 0.16, -0.5, 2.4, 0.7, 1.8, "#a0a5a8", "roof"));
  // entrée + enseigne
  P.push(box(0.1, 0.26, d * 0.4 + 0.08, 1.8, 1.8, 0.06, "#dfeaf2", "windows", { mat: "glass" }));
  P.push(box(0.1, gh + 0.0, d * 0.4 + 0.12, 3.6, 0.5, 0.08, "#ffffff", "sign", { mat: "sign", sign: def.sign ?? "LYCÉE" }));
  // cour : clôture, mât + drapeau, gymnase discret
  for (let i = -5; i <= 5; i++) P.push(box(i * 1.05 - 0.2, 0.2, d / 2 + 2.2, 0.06, 0.7, 0.06, "#3d4046", "props"));
  P.push(box(-0.2, 0.55, d / 2 + 2.2, w, 0.05, 0.05, "#3d4046", "props"));
  P.push(cyl(-w / 2 + 0.4, 0.2, d / 2 + 1.2, 0.08, 3.2, "#c9c9c9", "props"));
  P.push(box(-w / 2 + 0.75, 2.5, d / 2 + 1.2, 0.33, 0.22, 0.04, "#2f4c8a", "props"), box(-w / 2 + 1.08, 2.5, d / 2 + 1.2, 0.33, 0.22, 0.04, "#f4f2ee", "props"), box(-w / 2 + 1.41, 2.5, d / 2 + 1.2, 0.33, 0.22, 0.04, "#c1272d", "props"));
  P.push(box(w / 2 + 2.7, 0.2, -1.6, 4.0, 2.4, 3.2, "#b98f74", "walls", { tex: "brick", texRep: [2, 1.2] }), box(w / 2 + 2.7, 2.6, -1.6, 4.2, 0.14, 3.4, "#8c8880", "roof"));
  P.push(box(w / 2 + 2.7, 0.2, 1.5, 3.6, 0.04, 2.6, "#d98a4e", "foundation")); // terrain de sport
  P.push(cyl(w / 2 + 4.3, 0.2, 1.5, 0.07, 1.8, "#444", "props"), box(w / 2 + 4.15, 1.9, 1.5, 0.3, 0.2, 0.04, "#f4f4f4", "props"));
  [[-3, d / 2 + 1], [-1.4, d / 2 + 1.6], [0.8, d / 2 + 1.0], [2.6, d / 2 + 1.7], [4.0, d / 2 + 1.1], [-4.4, d / 2 + 1.7], [w / 2 + 2.2, 1.7], [w / 2 + 3.4, 0.9]].forEach(([x, z], i) =>
    P.push(...person(x, 0.2, z, ["#3d4c73", "#d85a5a", "#e8e8ea", "#4a8f6a", "#c9a24a", "#6b7fa8", "#e0457b", "#2f3340"][i], { s: 0.9 })));
  return P;
};

/* ───────────────────────── GARE (façade de pierre, grande verrière, halle vitrée) ───────────────────────── */
const station: Gen = (def) => {
  const [w, d, h] = def.size;
  const P: Part[] = [];
  const stone = "#ffffff";
  P.push(box(0, 0, 0, w + 2, 0.18, d + 1.2, "#b9b3a6", "foundation"));
  // quai (le long de la voie) + bordure
  P.push(box(0, 0, -4.1, 18, 0.2, 4.2, "#a9a69c", "foundation"));
  P.push(box(0, 0.2, -2.1, 18, 0.03, 0.12, "#e8d44a", "foundation"));
  // ailes
  const wing = (x: number) => {
    P.push(box(x, 0.18, 0, 3.3, 3.0, d, stone, "walls", { tex: "stone", texRep: [2, 1.5] }));
    P.push(prism(x, 3.18, 0, 3.5, 0.9, d + 0.3, "#7c8794", "roof"));
    P.push(...windowGrid("front", 3.3, d, 1.1, 1, 3, 0.55, 1.3, 0, "windows", "window", "#d3e4f1").map((p) => ({ ...p, pos: [p.pos[0] + x, p.pos[1], p.pos[2]] as [number, number, number] })));
    P.push(...windowGrid("front", 3.3, d, 2.3, 1, 3, 0.45, 0.5, 0, "windows", "window", "#d3e4f1").map((p) => ({ ...p, pos: [p.pos[0] + x, p.pos[1], p.pos[2]] as [number, number, number] })));
  };
  wing(-3.9); wing(3.9);
  // pavillon central, plus haut, grande baie
  P.push(box(0, 0.18, 0.3, 4.6, h - 0.6, d - 0.6, stone, "walls", { tex: "stone", texRep: [2.6, 2.4] }));
  P.push(box(0, 1.0, d / 2 - 0.25, 2.8, 2.7, 0.1, "#cfe1ee", "windows", { mat: "glass" }));
  for (let i = -2; i <= 2; i++) P.push(box(i * 0.55, 1.0, d / 2 - 0.2, 0.06, 2.7, 0.08, "#8a7a62", "windows"));
  P.push(box(0, 3.75, d / 2 - 0.2, 0.62, 0.62, 0.08, "#ffffff", "windows", { mat: "sign", sign: "@clock" }));
  P.push(box(0, h - 0.55, 0.3, 5.0, 0.22, d - 0.3, "#b9a07c", "roof")); // corniche
  P.push(prism(0, h - 0.33, 0.3, 5.0, 0.8, d - 0.3, "#6f7a87", "roof"));
  // pavillons latéraux
  for (const x of [-6.2, 6.2]) P.push(box(x, 0.18, 0.2, 1.8, 3.5, d - 0.4, stone, "walls", { tex: "stone", texRep: [1, 1.8] }), box(x, 3.68, 0.2, 2.0, 0.18, d - 0.2, "#b9a07c", "roof"));
  // statues sur la corniche
  for (const x of [-6.2, -2.4, 2.4, 6.2]) P.push(cyl(x, 3.86, d / 2 - 0.3, 0.3, 0.55, "#cbb58f", "props"), sphere(x, 4.41, d / 2 - 0.3, 0.2, "#cbb58f", "props"));
  P.push(box(0, 2.9, d / 2 + 0.1, 3.0, 0.4, 0.06, "#ffffff", "sign", { mat: "sign", sign: def.sign ?? "GARE" }));
  // halle vitrée : trois nefs à verrière + poteaux
  for (const x of [-3.7, 0, 3.7]) {
    P.push(prism(x, 3.2, -6.2, 3.6, 1.2, 8, "#a8c4d6", "roof", { mat: "glass" }));
    P.push(box(x - 1.75, 0.2, -6.2, 0.14, 3.0, 0.14, "#4b5260", "structure"), box(x + 1.75, 0.2, -6.2, 0.14, 3.0, 0.14, "#4b5260", "structure"));
    P.push(box(x - 1.75, 0.2, -9.7, 0.14, 3.0, 0.14, "#4b5260", "structure"), box(x + 1.75, 0.2, -9.7, 0.14, 3.0, 0.14, "#4b5260", "structure"));
    P.push(box(x - 1.75, 0.2, -2.8, 0.14, 3.0, 0.14, "#4b5260", "structure"), box(x + 1.75, 0.2, -2.8, 0.14, 3.0, 0.14, "#4b5260", "structure"));
  }
  // vie : voyageurs, bancs, lampadaires de quai
  [[-4, -3.3, "#3d4c73"], [-2.6, -4.2, "#d85a5a"], [-1.2, -3.5, "#2f3340"], [0.6, -4.4, "#c9a24a"], [2.4, -3.6, "#8a6bd1"], [4.4, -4.1, "#4a8f6a"], [6.0, -3.4, "#e8e8ea"]].forEach(([x, z, c]) =>
    P.push(...person(x as number, 0.2, z as number, c as string, { s: 1 })));
  for (const x of [-5.5, 5.5]) P.push(box(x, 0.2, -2.8, 1.2, 0.26, 0.35, "#6b5a45", "props"));
  P.push(box(0, 0.18, d / 2 + 1.1, 0.5, 0.4, 0.5, "#e8e4da", "props"));
  return P;
};

/* ───────────────────────── MJM / WEBSTART — d'après la photo : blocs béton, brise-soleil à lames, étage de verre, hall vitré ───────────────────────── */
const design: Gen = (def) => {
  const [w, d, h] = def.size;
  const P: Part[] = [];
  const x0 = -w / 2, x1 = w / 2;
  P.push(box(0, 0, 0.9, w + 1.8, 0.2, d + 3.0, "#b3b0a8", "foundation"));
  P.push(box(0.2, 0.2, 0.3, w - 1.4, 0.05, d * 0.8, "#4b4d52", "foundation"));
  // bloc béton gauche (derrière le hall) et bloc droit plus haut
  P.push(box(x0 + 0.7, 0.2, 0, 1.4, h + 0.4, d * 0.92, "#ffffff", "walls", { tex: "concrete", texRep: [1, 2.2] }));
  P.push(box(x1 - 0.5, 0.2, -0.2, 1.0, h + 1.0, d * 0.9, "#ffffff", "walls", { tex: "concrete", texRep: [1, 2.4] }));
  // hall vitré sur deux niveaux (à gauche) + montants
  const lx = x0 + 1.4, lw = 1.7;
  P.push(box(lx + lw / 2, 0.2, d * 0.2, lw, 3.4, 0.08, "#a9cfe6", "windows", { mat: "glass" }));
  for (const x of [lx, lx + lw / 2, lx + lw]) P.push(box(x, 0.2, d * 0.2 + 0.04, 0.06, 3.4, 0.06, "#3d4046", "structure"));
  P.push(box(lx + lw / 2, 3.6, d * 0.2, lw, 0.2, d * 0.35, "#50545a", "roof"));
  // rez-de-chaussée ouvert (stationnement) à droite : fond sombre, piliers, voitures
  const rx0 = lx + lw, rx1 = x1 - 1.0;
  P.push(box((rx0 + rx1) / 2, 0.2, -d * 0.1, rx1 - rx0, 1.7, 0.1, "#2c2f35", "walls"));
  P.push(box((rx0 + rx1) / 2 + 0.3, 0.2, d * 0.15, rx1 - rx0 - 0.9, 1.7, 0.06, "#cfe3ee", "windows", { mat: "glass" }));
  for (const x of [rx0 + 0.15, (rx0 + rx1) / 2, rx1 - 0.15]) P.push(box(x, 0.2, d * 0.32, 0.22, 1.7, 0.22, "#2c2f35", "structure"));
  // bande de brise-soleil à lames, en 3 trames
  const bx = (rx0 + rx1) / 2, bw = rx1 - lx;
  P.push(box((lx + rx1) / 2, 1.9, d * 0.1, bw, 2.25, d * 0.56, "#ffffff", "walls", { tex: "louvre", texRep: [bw / 2.4, 1.1] }));
  P.push(box((lx + rx1) / 2, 4.15, d * 0.1, bw + 0.1, 0.14, d * 0.58, "#6e7072", "roof"));
  // étage de verre (bureaux) en retrait + toit-terrasse
  P.push(box(bx - 0.2, 4.29, -d * 0.05, bw - 0.9, 1.35, d * 0.36, "#b8dcee", "windows", { mat: "glass" }));
  P.push(box(bx - 0.2, 5.64, -d * 0.05, bw - 0.8, 0.12, d * 0.4, "#6e7072", "roof"));
  // enseigne : panneau posé devant
  P.push(box(x0 + 0.1, 0.2, d / 2 + 1.5, 2.3, 1.1, 0.12, "#8a8b8f", "sign", { mat: "sign", sign: def.sign ?? "MJM" }));
  // plantes, voitures, personnages
  for (const x of [lx + 0.2, lx + 1.0, rx0 + 0.6]) P.push(box(x, 0.2, d / 2 + 1.0, 0.4, 0.45, 0.4, "#6f8f52", "props"));
  const car = (x: number, z: number, c: string) => P.push(box(x, 0.2, z, 1.5, 0.38, 0.75, c, "props"), box(x + 0.05, 0.58, z, 0.8, 0.3, 0.68, "#cfe0ea", "props"));
  car(rx0 + 0.9, d * 0.05, "#e8e8ea"); car(rx1 - 0.9, d * 0.05, "#c1272d"); car(x0 - 1.5, d / 2 + 1.7, "#4a8fd0"); car(x1 + 1.4, d / 2 + 1.7, "#9aa7b8");
  [[bx - 1.2, -d * 0.1, "#3d4c73"], [bx + 0.3, -d * 0.12, "#e8e8ea"], [bx + 1.2, -d * 0.08, "#3d4c73"]].forEach(([x, z, c]) => P.push(...person(x as number, 4.29, z as number, c as string, { s: 0.8 })));
  P.push(...person(lx + lw / 2, 0.25, d * 0.45, "#e0457b"), ...person(rx0 + 1.8, 0.2, d / 2 + 1.1, "#35b6d6"));
  return P;
};

/* ───────────────────────── CFA OMNISPORT — institutionnel + silhouette lointaine du stade ───────────────────────── */
const cfa: Gen = (def) => {
  const [w, d, h] = def.size;
  const P: Part[] = [];
  P.push(box(0, 0, 0.5, w + 1.6, 0.2, d + 2.4, "#b5b1a8", "foundation"));
  P.push(box(0, 0.2, 0, w, 1.8, d, "#a9cfe6", "windows", { mat: "glass" }));
  for (let i = -3; i <= 3; i++) P.push(box(i * w / 6, 0.2, d / 2, 0.12, 1.8, 0.12, "#40495a", "structure"));
  P.push(box(0, 2.0, 0, w + 0.3, h - 2.0, d + 0.3, "#8fa3b8", "walls"));
  P.push(...windowGrid("front", w, d, 2.5, 1, 6, 0.75, 0.55, 0, "windows"));
  P.push(...windowGrid("right", w, d, 2.5, 1, 4, 0.75, 0.55, 0, "windows"));
  P.push(box(0, h, 0, w + 0.7, 0.2, d + 0.7, "#e8e6e0", "roof"));
  P.push(box(0, 1.55, d / 2 + 0.16, 3.2, 0.45, 0.1, "#ffffff", "sign", { mat: "sign", sign: def.sign ?? "CFA" }));
  // mini terrain de sport voisin
  P.push(box(-w / 2 - 3.4, 0.0, 0.8, 4.2, 0.08, 6, "#5f9a55", "foundation"));
  P.push(box(-w / 2 - 3.4, 0.08, 0.8, 3.6, 0.02, 0.1, "#f4f4f4", "foundation"));
  P.push(box(-w / 2 - 3.4, 0.08, -2.0, 1.2, 0.5, 0.06, "#f4f4f4", "props"), box(-w / 2 - 3.4, 0.08, 3.6, 1.2, 0.5, 0.06, "#f4f4f4", "props"));
  [[-w / 2 - 3.8, 0.4, "#c1272d"], [-w / 2 - 2.8, 1.4, "#2f4c8a"], [-w / 2 - 3.2, 2.4, "#c1272d"]].forEach(([x, z, c]) => P.push(...person(x as number, 0.08, z as number, c as string, { s: 0.9 })));
  [[-1.8, d / 2 + 1], [0.4, d / 2 + 1.3], [2.2, d / 2 + 0.9]].forEach(([x, z], i) => P.push(...person(x, 0.2, z, ["#2f4c8a", "#e8e8ea", "#4a8f6a"][i], { s: 1 })));
  // Parc des Princes — en arrière-plan seulement : couronne de nervures de béton + mâts d'éclairage
  const sx = 8.5, sz = -12.2, rx = 5.4, rz = 4.2, n = 18;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    P.push(box(sx + Math.cos(a) * rx, 0, sz + Math.sin(a) * rz, 0.7, 2.7, 0.7, "#c8c3b8", "walls", { rotY: -a + Math.PI / 2 }));
    P.push(box(sx + Math.cos(a) * (rx - 0.7), 0, sz + Math.sin(a) * (rz - 0.55), 0.7, 1.6, 0.7, "#8e9a8e", "walls", { rotY: -a + Math.PI / 2 }));
  }
  P.push(box(sx, 0, sz, 5.6, 0.08, 4.4, "#5f9a55", "walls"));
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as [number, number][]) {
    P.push(cyl(sx + dx * (rx + 0.6), 0, sz + dz * (rz + 0.4), 0.14, 5.2, "#9aa0a8", "roof"));
    P.push(box(sx + dx * (rx + 0.6), 5.2, sz + dz * (rz + 0.4), 0.9, 0.35, 0.3, "#f4f1d8", "roof", { mat: "emit", emissive: "#fff2c0" }));
  }
  return P;
};

/* ───────────────────────── FFJUDO — d'après la photo : longue barre de béton à bandeaux + grande coupole sombre nervurée ───────────────────────── */
const federation: Gen = (def) => {
  const [w, d, h] = def.size;
  const P: Part[] = [];
  P.push(box(0, 0, 0.3, w + 1.8, 0.2, d + 2.6, "#b9b6ae", "foundation"));
  // barre : 8 niveaux de bandeaux vitrés, deux édicules en toiture
  const sw = w * 0.74, sx = -w / 2 + sw / 2, sd = 2.5, sz = -d / 2 + sd / 2;
  P.push(box(sx, 0.2, sz, sw, h + 1.1, sd, "#ffffff", "walls", { tex: "slabwin", texRep: [sw / 4, 1.4] }));
  P.push(box(sx, h + 1.3, sz, sw + 0.15, 0.16, sd + 0.15, "#8c8f90", "roof"));
  P.push(box(sx - 1.2, h + 1.46, sz, 1.0, 0.5, 1.2, "#a8abad", "roof"), box(sx + 1.8, h + 1.46, sz, 1.2, 0.4, 1.2, "#a8abad", "roof"), box(sx + 3.4, h + 1.46, sz, 0.7, 0.35, 1.0, "#a8abad", "roof"));
  // coupole sombre à nervures (large, débordant devant la barre)
  const cx = w / 2 - 3.4, cz = d / 2 - 2.3;
  P.push(cyl(cx, 0.2, cz, 1, 1.5, "#ffffff", "walls", { size: [7.0, 1.5, 5.4], tex: "ribs", texRep: [28, 1] } as never));
  P.push(box(cx, 0.9, cz + 2.65, 3.6, 0.45, 0.08, "#9bb673", "windows", { mat: "emit", emissive: "#6b8a4b" }));
  P.push(dome(cx, 1.7, cz, 7.0, 2.4, 5.4, "#ffffff", "roof", { tex: "ribs", texRep: [28, 1] }));
  P.push(dome(cx - 0.4, 4.0, cz - 0.1, 3.0, 0.3, 2.1, "#9ec3d6", "roof", { mat: "glass" }));
  // pavillon d'accueil vitré + enseigne, mâts aux couleurs
  P.push(box(-w / 2 + 1.5, 0.2, d / 2 - 1.2, 3.0, 1.9, 1.8, "#a9cfe6", "windows", { mat: "glass" }));
  P.push(box(-w / 2 + 1.5, 2.1, d / 2 - 1.2, 3.3, 0.14, 2.1, "#e8e6e0", "roof"));
  P.push(box(-w / 2 + 1.5, 1.55, d / 2 - 0.3, 2.6, 0.4, 0.08, "#ffffff", "sign", { mat: "sign", sign: "FÉDÉRATION FRANÇAISE\nDE JUDO" }));
  [["#2f4c8a", 0], ["#f4f2ee", 0.7], ["#c1272d", 1.4]].forEach(([c, dx]) => {
    P.push(cyl(-w / 2 + 3.8 + (dx as number), 0.2, d / 2 + 0.9, 0.07, 3.0, "#c9c9c9", "props"));
    P.push(box(-w / 2 + 3.8 + (dx as number) + 0.24, 2.4, d / 2 + 0.9, 0.45, 0.3, 0.04, c as string, "props"));
  });
  for (let i = 0; i < 3; i++) P.push(box(-w / 2 + 1.5, 0.2 + i * 0.08, d / 2 + 0.7 + 0.3 * (2 - i), 2.4, 0.08, 0.3, "#c9c5bc", "foundation"));
  [[-w / 2 + 0.8, d / 2 + 1.3, "#2f3340"], [-w / 2 + 2.2, d / 2 + 1.5, "#34406e"], [cx - 2.4, d / 2 + 1.2, WHITE_GI], [cx - 1.0, d / 2 + 1.5, WHITE_GI]].forEach(([x, z, c]) => P.push(...person(x as number, 0.2, z as number, c as string)));
  return P;
};

/* ───────────────────────── DOJO DE PARIS — le coach : pierre + bois, double toit, accents rouges ───────────────────────── */
const dojoParis: Gen = (def) => {
  const [w, d, h] = def.size;
  const P: Part[] = [];
  P.push(box(0, 0, 0.8, w + 2, 0.25, d + 2.8, "#b4aea2", "foundation"));
  P.push(box(0, 0.25, 0, w - 0.5, 0.05, d - 0.5, "#ffffff", "foundation", { tex: "tatami", texRep: [4, 3] }));
  const stone = "#ffffff";
  // niveau bas en pierre, grande baie ouverte côté +z
  P.push(box(0, 0.25, -d / 2 + 0.15, w, 2.5, 0.3, stone, "walls", { tex: "stone", texRep: [3, 1.6] }));
  P.push(box(-w / 2 + 0.15, 0.25, 0, 0.3, 2.5, d, stone, "walls", { tex: "stone", texRep: [3, 1.6] }));
  P.push(box(w / 2 - 0.15, 0.25, 0, 0.3, 2.5, d, stone, "walls", { tex: "stone", texRep: [3, 1.6] }));
  P.push(box(w / 2 - 0.15, 0.9, 0, 0.1, 1.5, d - 1.2, "#bcd8ec", "windows", { mat: "glass" }));
  P.push(box(-w / 2 + 1.3, 0.25, d / 2 - 0.15, 2.6, 2.5, 0.3, stone, "walls", { tex: "stone", texRep: [1.5, 1.6] }));
  P.push(box(w / 2 - 1.3, 0.25, d / 2 - 0.15, 2.6, 2.5, 0.3, stone, "walls", { tex: "stone", texRep: [1.5, 1.6] }));
  P.push(box(0, 2.0, d / 2 - 0.15, w - 5.2, 0.75, 0.3, "#b98a5a", "walls"));
  // étage en bois
  P.push(box(0, 2.75, 0, w * 0.86, 1.7, d * 0.84, "#b98a5a", "walls"));
  P.push(...windowGrid("front", w * 0.86, d * 0.84, 3.1, 1, 4, 0.8, 0.8, 0, "windows", "window", "#cfe3f1"));
  P.push(...windowGrid("right", w * 0.86, d * 0.84, 3.1, 1, 3, 0.8, 0.8, 0, "windows", "window", "#cfe3f1"));
  // double toit en croupe, avec liseré rouge
  P.push(box(0, 2.72, 0, w + 1.2, 0.14, d + 1.2, "#c1272d", "roof"));
  P.push(pyr(0, 2.86, 0, w + 1.5, 0.85, d + 1.5, "#383b48", "roof"));
  P.push(box(0, 4.44, 0, w * 0.86 + 0.8, 0.12, d * 0.84 + 0.8, "#c1272d", "roof"));
  P.push(pyr(0, 4.56, 0, w * 0.86 + 1.1, 1.0, d * 0.84 + 1.1, "#383b48", "roof"));
  P.push(sphere(0, 5.5, 0, 0.3, "#e8d44a", "roof"));
  // emblèmes discrets : CFA Omnisport (bleu) et Fédération (rouge)
  P.push(box(-1.6, 2.1, d / 2 + 0.05, 0.55, 0.65, 0.06, "#2f4c8a", "sign", { mat: "emit", emissive: "#2f4c8a" }), box(1.6, 2.1, d / 2 + 0.05, 0.55, 0.65, 0.06, "#c1272d", "sign", { mat: "emit", emissive: "#c1272d" }));
  P.push(box(0, 4.0, d * 0.42 + 0.06, 3.4, 0.5, 0.06, "#ffffff", "sign", { mat: "sign", sign: def.sign ?? "DOJO DE PARIS" }));
  // lanternes
  for (const x of [-1.9, 1.9]) P.push(cyl(x, 0.25, d / 2 + 0.9, 0.08, 1.4, "#383b48", "props"), sphere(x, 1.65, d / 2 + 0.9, 0.3, "#ffd48a", "props", { mat: "emit", emissive: "#ffb85c" }));
  // le coach + la ligne d'élèves, tatamis visibles
  P.push(...person(0, 0.3, -1.4, "#1e2a50", { s: 1.15 }));
  [-2.4, -1.2, 0, 1.2, 2.4].forEach((x, i) => P.push(...person(x, 0.3, -0.2, WHITE_GI, { belt: ["#e0c040", "#d85a5a", "#4a8fd0", "#7747FF", "#2f3340"][i], s: 0.9 })));
  P.push(...person(-1, 0.25, d / 2 + 1.3, "#8a6bd1"), ...person(2.3, 0.25, d / 2 + 1.0, "#c9a24a"));
  return P;
};

/* ───────────────────────── GRAND DÔME DE VILLEBON — d'après la photo : dôme blanc nervuré sur socle de béton, rampes en étoile ───────────────────────── */
const arena: Gen = (def) => {
  const [w, d] = def.size;
  const P: Part[] = [];
  const R = Math.min(w, d) / 2 - 1.4;
  P.push(box(0, 0, 0, w, 0.2, d, "#c9c5bc", "foundation"));
  // socle de béton : deux ailes sur pilotis + liaison
  P.push(box(-R * 0.62, 0.2, 0, 2.4, 1.5, R * 1.7, "#ffffff", "walls", { tex: "concrete", texRep: [2, 0.8] }));
  P.push(box(R * 0.62, 0.2, 0, 2.4, 1.5, R * 1.7, "#ffffff", "walls", { tex: "concrete", texRep: [2, 0.8] }));
  P.push(box(0, 0.2, R * 0.62, R * 1.6, 1.5, 2.2, "#ffffff", "walls", { tex: "concrete", texRep: [3, 0.8] }));
  P.push(box(0, 0.2, -R * 0.62, R * 1.6, 1.5, 2.2, "#ffffff", "walls", { tex: "concrete", texRep: [3, 0.8] }));
  for (let i = -3; i <= 3; i++) P.push(box(-R * 0.62 - 1.3, 0.2, i * R * 0.25, 0.14, 1.3, 0.14, "#bdbab2", "structure"), box(R * 0.62 + 1.3, 0.2, i * R * 0.25, 0.14, 1.3, 0.14, "#bdbab2", "structure"));
  // dôme blanc à nervures radiales, anneau de rive, oculus
  P.push(cyl(0, 1.2, 0, 1, 0.9, "#ffffff", "walls", { size: [R * 2, 0.9, R * 2], tex: "radial", texRep: [32, 1] } as never));
  P.push(dome(0, 2.1, 0, R * 2 - 0.2, 1.5, R * 2 - 0.2, "#ffffff", "roof", { tex: "radial", texRep: [32, 1] }));
  P.push(cyl(0, 3.55, 0, 1, 0.1, "#ffffff", "roof", { size: [R * 0.5, 0.1, R * 0.5] } as never));
  P.push(cyl(0, 1.95, 0, 1, 0.16, "#dedcd6", "roof", { size: [R * 2 + 0.3, 0.16, R * 2 + 0.3] } as never));
  // rampes diagonales aux quatre angles
  const len = 4.4, drop = 1.7, ang = Math.atan2(drop, len);
  [1, 3, 5, 7].forEach((k) => {
    const a = (k * Math.PI) / 4, cr = R + 1.0 + len / 2;
    P.push(box(Math.cos(a) * cr, drop / 2 - 0.2, Math.sin(a) * cr, len, 0.22, 0.9, "#b9b6ae", "structure", { rotY: -a, rotZ: -ang * (Math.cos(0) ) }));
  });
  P.push(box(0, 0.2, R + 1.0, 3.0, 0.6, 0.6, "#a9a69c", "foundation"));
  P.push(box(0, 1.0, R * 0.62 + 1.12, 2.6, 0.7, 0.08, "#ffffff", "sign", { mat: "sign", sign: def.sign ?? "GRAND DÔME" }));
  [[-1.5, R + 1.9], [0.6, R + 2.3], [1.8, R + 1.6]].forEach(([x, z], i) => P.push(...person(x, 0.2, z, ["#2f3340", "#d85a5a", "#4a8fd0"][i])));
  return P;
};

/* ───────────────────────── Aperçu du futur ───────────────────────── */
const tower: Gen = (def) => {
  const [w, d, h] = def.size;
  const P: Part[] = [];
  P.push(box(0, 0, 0, w + 2.4, 0.25, d + 2.4, "#aeb0b6", "foundation"));
  const tiers: [number, number, number][] = [[1, 0.5, 0], [0.82, 0.3, 0.5], [0.62, 0.2, 0.8]];
  let y = 0.25;
  tiers.forEach(([s, hh], i) => {
    const th = h * hh;
    P.push(box(0, y, 0, w * s, th, d * s, "#ffffff", "walls", { tex: "curtain", texRep: [w * s / 3, th / 3], mat: "std" }));
    P.push(box(0, y + th, 0, w * s + 0.3, 0.18, d * s + 0.3, i === 0 ? "#7747FF" : "#40455a", "roof", { mat: i === 0 ? "emit" : "std", emissive: "#7747FF" }));
    y += th + 0.18;
  });
  P.push(cyl(0, y, 0, 0.12, 3, "#9aa0a8", "roof"));
  P.push(box(0, 1.2, d / 2 + 1.0, 3.4, 0.55, 0.1, "#ffffff", "sign", { mat: "sign", sign: def.sign ?? "DUQQUE" }));
  return P;
};
const block: Gen = (def) => {
  const [w, d, h] = def.size;
  const col = def.tint ?? "#ffffff";
  return [
    box(0, 0, 0, w + 1, 0.18, d + 1, "#b3b1aa", "foundation"),
    box(0, 0.18, 0, w, h, d, col, "walls", { tex: "curtain", texRep: [w / 3, h / 3] }),
    box(0, h + 0.18, 0, w + 0.3, 0.18, d + 0.3, "#6e7072", "roof"),
    ...(def.sign ? [box(0, 0.8, d / 2 + 0.06, 2.2, 0.4, 0.06, "#ffffff", "sign" as const, { mat: "sign" as const, sign: def.sign })] : []),
    ...person(w / 2 + 0.2, 0.18, d / 2 + 0.6, "#3d4c73"),
  ];
};
const house: Gen = (def) => {
  const [w, d, h] = def.size;
  const col = def.tint ?? "#e3c9a8";
  return [
    box(0, 0, 0, w + 0.6, 0.12, d + 0.6, "#b3b1aa", "foundation"),
    box(0, 0.12, 0, w, h, d, col, "walls"),
    prism(0, h + 0.12, 0, w + 0.5, 1.3, d + 0.5, "#a4553f", "roof"),
    box(0, 0.12, d / 2 + 0.02, 0.6, 1.2, 0.06, "#6e5842", "windows"),
    ...windowGrid("front", w, d, 1.0, 1, 2, 0.5, 0.6, 0, "windows").map((p) => ({ ...p, pos: [p.pos[0] * 1.0, p.pos[1], p.pos[2]] as [number, number, number] })),
  ];
};
const site: Gen = (def) => {
  const [w, d, h] = def.size;
  const P: Part[] = [box(0, 0, 0, w + 2, 0.2, d + 2, "#a99a80", "foundation")];
  for (const [x, z] of [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]] as [number, number][]) P.push(box(x, 0.2, z, 0.3, h, 0.3, "#9c9a96", "structure"));
  for (let i = 1; i <= 2; i++) P.push(box(0, 0.2 + i * 2, 0, w, 0.22, d, "#b5b2ab", "walls"));
  P.push(cyl(w / 2 + 1.3, 0.2, 0, 0.3, 9, "#e8b830", "structure"), box(0, 9.2, 0, w + 4, 0.28, 0.28, "#e8b830", "structure"), box(w / 2 + 1.3, 8.7, 0, 0.5, 0.5, 0.5, "#e8b830", "structure"), box(-w / 2 - 0.5, 8.1, 0, 0.14, 1.1, 0.14, "#555", "structure"));
  P.push(box(-w / 2 - 1.2, 0.2, d / 2 + 0.8, 1.6, 0.6, 1.0, "#c9702f", "props"));
  return P;
};
const landmark: Gen = () => {
  const P: Part[] = [];
  P.push(pyr(0, 0, 0, 3.2, 3.0, 3.2, "#ffffff", "structure", { tex: "lattice", texRep: [2, 2], mat: "std" }));
  P.push(pyr(0, 3.0, 0, 1.7, 2.8, 1.7, "#ffffff", "structure", { tex: "lattice", texRep: [1.5, 1.5], mat: "std" }));
  P.push(pyr(0, 5.8, 0, 0.8, 2.2, 0.8, "#4b4f57", "structure"));
  P.push(sphere(0, 8.0, 0, 0.22, "#7747FF", "props", { mat: "emit", emissive: "#7747FF" }));
  return P;
};

export const archetypes: Record<BuildingDef["archetype"], Gen> = {
  dojo, school, station, design, cfa, federation, dojoParis, arena, tower, block, house, site, landmark,
};
