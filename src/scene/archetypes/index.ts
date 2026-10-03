import type { BuildingDef } from "@/data/types";
import { box, cyl, prism, pyr, dome, sphere, person, windowGrid, type Part } from "../parts";

type Gen = (def: BuildingDef) => Part[];
const WHITE_GI = "#f4f2ee";

/* ───────────────────────── JC LEFOREST — petit dojo de club (brique, parapet blanc, porte rouge) ───────────────────────── */
const dojo: Gen = (def) => {
  const [w, d] = def.size;
  const H = 2.45;
  const brick = def.tint ?? "#ffffff"; // la teinte colore la texture brique
  const P: Part[] = [];
  // fondation + sol de tatamis
  P.push(box(0, 0, 0.5, w + 1.6, 0.25, d + 2.2, "#b8b1a4", "foundation"));
  P.push(box(0, 0.25, 0, w - 0.4, 0.05, d - 0.4, "#ffffff", "foundation", { tex: "tatami", texRep: [3, 2.2] }));
  // ossature
  for (const [x, z] of [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2], [0, -d / 2], [0, d / 2]] as [number, number][])
    P.push(box(x, 0.3, z, 0.22, H, 0.22, "#6e5842", "structure"));
  // murs : fond, gauche
  P.push(box(0, 0.25, -d / 2 + 0.1, w, H, 0.22, brick, "walls", { tex: "brick", texRep: [w / 2.2, 1.3] }));
  P.push(box(-w / 2 + 0.1, 0.25, 0, 0.22, H, d, brick, "walls", { tex: "brick", texRep: [d / 2.2, 1.3] }));
  // mur droit (+x) : allège + linteau + trumeaux, tatamis visibles à travers les baies
  P.push(box(w / 2 - 0.1, 0.25, 0, 0.22, 0.75, d, brick, "walls", { tex: "brick", texRep: [d / 2.2, 0.5] }));
  P.push(box(w / 2 - 0.1, 0.25 + H - 0.6, 0, 0.22, 0.6, d, brick, "walls", { tex: "brick", texRep: [d / 2.2, 0.4] }));
  for (const z of [-d / 2 + 0.2, -d / 6, d / 6, d / 2 - 0.2])
    P.push(box(w / 2 - 0.1, 1.0, z, 0.24, H - 1.35, 0.32, brick, "walls", { tex: "brick", texRep: [0.4, 1] }));
  for (const z of [-d / 3, 0, d / 3])
    P.push(box(w / 2 - 0.1, 1.0, z, 0.08, H - 1.35, d / 3 - 0.34, "#bcd8ec", "windows", { mat: "glass" }));
  // façade avant : deux pans de brique + baie centrale vitrée avec encadrement blanc, porte rouge
  const fw = (w - 2.4) / 2;
  P.push(box(-w / 2 + fw / 2, 0.25, d / 2 - 0.1, fw, H, 0.22, brick, "walls", { tex: "brick", texRep: [fw / 2.2, 1.3] }));
  P.push(box(w / 2 - fw / 2, 0.25, d / 2 - 0.1, fw, H, 0.22, brick, "walls", { tex: "brick", texRep: [fw / 2.2, 1.3] }));
  P.push(box(0, 0.25 + 1.9, d / 2 - 0.1, 2.4, H - 1.9, 0.22, brick, "walls", { tex: "brick", texRep: [1.1, 0.3] }));
  P.push(box(0, 0.3, d / 2 - 0.06, 2.3, 1.85, 0.06, "#bcd8ec", "windows", { mat: "glass" }));
  P.push(box(0.55, 0.3, d / 2 + 0.0, 0.9, 1.75, 0.08, "#9b2227", "windows"));
  P.push(box(-0.55, 0.3, d / 2 + 0.0, 0.9, 1.75, 0.08, "#9b2227", "windows"));
  // encadrement blanc de l'entrée
  P.push(box(-1.28, 0.25, d / 2 + 0.05, 0.14, 2.1, 0.16, "#f4f1ea", "walls"), box(1.28, 0.25, d / 2 + 0.05, 0.14, 2.1, 0.16, "#f4f1ea", "walls"), box(0, 2.3, d / 2 + 0.05, 2.7, 0.14, 0.16, "#f4f1ea", "walls"));
  // toiture-terrasse : dalle, acrotère blanc, lanterneaux
  const ty = 0.25 + H;
  P.push(box(0, ty, 0, w + 0.3, 0.16, d + 0.3, "#8c8880", "roof"));
  const pw = 0.18, ph = 0.34;
  P.push(box(0, ty + 0.16, d / 2 + 0.06, w + 0.4, ph, pw, "#f4f1ea", "roof"), box(0, ty + 0.16, -d / 2 - 0.06, w + 0.4, ph, pw, "#f4f1ea", "roof"),
    box(w / 2 + 0.06, ty + 0.16, 0, pw, ph, d + 0.3, "#f4f1ea", "roof"), box(-w / 2 - 0.06, ty + 0.16, 0, pw, ph, d + 0.3, "#f4f1ea", "roof"));
  for (const [x, z] of [[1.6, 1.0], [2.4, -0.2], [0.8, -0.9], [-0.4, 1.2]] as [number, number][])
    P.push(box(x, ty + 0.16, z, 0.55, 0.14, 0.55, "#e9e6df", "roof"), box(x, ty + 0.3, z, 0.4, 0.04, 0.4, "#bcd8ec", "roof", { mat: "glass" }));
  // volume supérieur blanc à bandeaux vitrés (comme la référence)
  const uw = w * 0.62, ud = d * 0.5;
  P.push(box(-w * 0.14, ty + 0.16, -d * 0.2, uw, 1.1, ud, "#ffffff", "roof", { tex: "ribbon", texRep: [uw / 2.4, 1], mat: "std" }));
  P.push(box(-w * 0.14, ty + 1.26, -d * 0.2, uw + 0.2, 0.14, ud + 0.2, "#f4f1ea", "roof"));
  // enseigne
  P.push(box(0, 2.38, d / 2 + 0.16, 2.4, 0.46, 0.08, "#ffffff", "sign", { mat: "sign", sign: def.sign ?? "DOJO" }));
  // vie : judokas sur le tatami, parents, sac
  const kid = ["#7747FF", "#e0c040", "#d85a5a", "#4a8fd0", "#ffffff", "#e08a3a"];
  [[-1.8, -0.6], [-0.6, -1.1], [0.7, -0.8], [1.9, -0.4], [-1.2, 0.5], [0.4, 0.7]].forEach(([x, z], i) =>
    P.push(...person(x, 0.3, z, WHITE_GI, { belt: kid[i], s: 0.85 })));
  P.push(...person(2.2, 0.3, 1.0, "#2f3340", { s: 1 })); // coach
  [[-2.2, d / 2 + 1.0, "#8a6bd1"], [2.0, d / 2 + 1.1, "#d9a066"], [2.6, d / 2 + 0.6, "#4a6fa5"]].forEach(([x, z, c]) => P.push(...person(x as number, 0.25, z as number, c as string, { s: 1 })));
  P.push(box(-2.6, 0.25, d / 2 + 1.3, 0.5, 0.3, 0.3, "#2f3340", "props")); // sac
  P.push(box(-w / 2 - 0.2, 0.25, d / 2 + 0.9, 1.4, 0.28, 0.4, "#7a6048", "props")); // banc
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
  P.push(box(0.5, 0.26, 0, w * 0.74, gh, d * 0.8, "#a9cfe6", "windows", { mat: "glass" }));
  for (let i = -3; i <= 3; i++) P.push(box(0.5 + i * (w * 0.74) / 6, 0.26, d * 0.4, 0.1, gh, 0.1, "#3d4046", "structure"));
  // noyaux béton
  P.push(box(-w / 2 + 0.9, 0.2, -0.2, 1.8, gh + 0.1, d * 0.8, "#ffffff", "walls", { tex: "concrete", texRep: [1, 1] }));
  P.push(box(w / 2 - 0.45, 0.2, 0, 0.9, gh + 0.1, d * 0.8, "#ffffff", "walls", { tex: "concrete", texRep: [1, 1] }));
  // pilotis
  for (const x of [-w * 0.2, w * 0.1, w * 0.32]) P.push(box(x, 0.26, d * 0.42, 0.28, gh, 0.28, "#d4d6d6", "structure"));
  // volume supérieur perforé
  const uy = 0.26 + gh, uh = h - gh - 0.5;
  P.push(box(-0.5, uy, 0, w, uh, d, "#ffffff", "walls", { tex: "typo", texRep: [1, 1], mat: "std" }));
  P.push(cyl(w / 2 - 0.5 - 0.0, uy, d / 2 - 0.35, 0.7, uh, "#c8ccce", "walls")); // angle arrondi
  P.push(box(-0.5, uy + uh, 0, w + 0.1, 0.16, d + 0.1, "#8f9498", "roof"));
  P.push(box(-w * 0.2, uy + uh + 0.16, -0.5, 2.4, 0.7, 1.8, "#a0a5a8", "roof"));
  // entrée + enseigne
  P.push(box(0.5, 0.26, d * 0.4 + 0.08, 1.8, 1.8, 0.06, "#dfeaf2", "windows", { mat: "glass" }));
  P.push(box(0.5, gh + 0.0, d * 0.4 + 0.12, 3.6, 0.5, 0.08, "#ffffff", "sign", { mat: "sign", sign: def.sign ?? "LYCÉE" }));
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

/* ───────────────────────── MJM / WEBSTART — verre, béton, brise-soleil à lames, volume créatif ───────────────────────── */
const design: Gen = (def) => {
  const [w, d, h] = def.size;
  const P: Part[] = [];
  P.push(box(0, 0, 0.9, w + 1.8, 0.2, d + 3.0, "#b3b0a8", "foundation"));
  P.push(box(0.3, 0.2, 0.3, w * 0.55, 0.05, d * 0.7, "#d8d6d0", "foundation"));
  // rez-de-chaussée : hall vitré entre deux blocs béton
  P.push(box(0.3, 0.25, 0.3, w * 0.52, 1.9, d * 0.72, "#a9cfe6", "windows", { mat: "glass" }));
  for (let i = -3; i <= 3; i++) P.push(box(0.3 + i * w * 0.52 / 6, 0.25, d * 0.36 + 0.3, 0.07, 1.9, 0.07, "#3d4046", "structure"));
  P.push(box(-w * 0.37, 0.2, 0, w * 0.26, h + 0.2, d * 0.92, "#ffffff", "walls", { tex: "concrete", texRep: [1, 2.2] }));
  P.push(box(w * 0.4, 0.2, -0.2, w * 0.22, h + 0.9, d * 0.88, "#ffffff", "walls", { tex: "concrete", texRep: [1, 2.4] }));
  // bande de brise-soleil à lames
  P.push(box(0.35, 2.15, 0.2, w * 0.54, 2.0, d * 0.7, "#ffffff", "walls", { tex: "louvre", texRep: [2.4, 1.5] }));
  P.push(box(0.35, 4.15, 0.2, w * 0.56, 0.14, d * 0.72, "#6e7072", "roof"));
  // étage de verre (bureaux) en retrait
  P.push(box(0.6, 4.29, -0.5, w * 0.52, 1.35, d * 0.5, "#b8dcee", "windows", { mat: "glass" }));
  P.push(box(0.6, 5.64, -0.5, w * 0.56, 0.12, d * 0.54, "#6e7072", "roof"));
  // atelier en sheds (toit en dents de scie) côté droit : la création
  for (const z of [-1.2, 0.4, 2.0]) P.push(prism(w * 0.4, h + 0.9, z, w * 0.2, 0.7, 1.5, "#d8d8d4", "roof", { rotY: 0 }));
  // écrans & affiches colorés
  P.push(box(-w * 0.37, 1.2, d * 0.46 + 0.04, 1.0, 0.7, 0.05, "#e0457b", "sign", { mat: "emit", emissive: "#e0457b" }));
  P.push(box(-w * 0.37, 2.2, d * 0.46 + 0.04, 1.0, 0.7, 0.05, "#35b6d6", "sign", { mat: "emit", emissive: "#35b6d6" }));
  P.push(box(-w * 0.37, 3.2, d * 0.46 + 0.04, 1.0, 0.7, 0.05, "#f2c230", "sign", { mat: "emit", emissive: "#f2c230" }));
  P.push(box(0.3, 2.3, d * 0.36 + 0.9, 3.6, 0.5, 0.08, "#ffffff", "sign", { mat: "sign", sign: def.sign ?? "MJM" }));
  // intérieur / bureaux : chevalets, tables, étudiants
  [[-0.6, 0.0], [1.0, 0.6], [2.0, -0.4]].forEach(([x, z]) => P.push(box(x, 0.25, z, 0.7, 0.4, 0.5, "#e9e4da", "props")));
  [[-1.2, 0.5, "#e0457b"], [0.4, -0.2, "#35b6d6"], [1.8, 0.5, "#f2c230"]].forEach(([x, z, c]) => P.push(...person(x as number, 0.25, z as number, c as string, { s: 0.9 })));
  [[-0.4, -0.7], [1.4, -0.9]].forEach(([x, z]) => P.push(...person(x, 4.29, z, "#3d4c73", { s: 0.8 })));
  // parvis : jardinières, cubes typographiques, voitures garées, panneau
  for (const x of [-1.2, 0.2, 1.6, 3.0]) P.push(box(x, 0.2, d / 2 + 1.1, 0.5, 0.45, 0.5, "#6f8f52", "props"));
  const car = (x: number, z: number, c: string) => P.push(box(x, 0.2, z, 1.5, 0.38, 0.75, c, "props"), box(x + 0.05, 0.58, z, 0.8, 0.3, 0.68, "#cfe0ea", "props"));
  car(-w / 2 - 1.6, d / 2 + 1.5, "#4a8fd0"); car(w / 2 + 1.4, d / 2 + 1.7, "#9aa7b8");
  P.push(...person(w / 2 + 0.2, 0.2, d / 2 + 1.0, "#e0457b"), ...person(-1.8, 0.2, d / 2 + 1.4, "#35b6d6"));
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

/* ───────────────────────── FFJUDO — barre institutionnelle + coupole sombre (salle de formation) ───────────────────────── */
const federation: Gen = (def) => {
  const [w, d, h] = def.size;
  const P: Part[] = [];
  P.push(box(0, 0, 0.3, w + 1.6, 0.2, d + 2.4, "#b9b6ae", "foundation"));
  // barre béton à bandeaux (volume long et mince)
  P.push(box(-1.2, 0.2, -1.5, w - 1.2, h - 0.2, 2.5, "#ffffff", "walls", { tex: "concrete", texRep: [4.5, 1.7] }));
  for (let r = 0; r < 4; r++) P.push(box(-1.2, 0.9 + r * 0.8, -0.24, w - 1.6, 0.28, 0.05, "#7f98ac", "windows", { mat: "window" }));
  P.push(box(-1.2, h, -1.5, w - 1.0, 0.16, 2.7, "#8c8f90", "roof"));
  P.push(box(-3, h + 0.16, -1.5, 1.2, 0.5, 1.1, "#a8abad", "roof"), box(1.2, h + 0.16, -1.5, 1.4, 0.4, 1.1, "#a8abad", "roof"));
  // coupole de la salle de formation (tatamis visibles par la baie)
  const cx = w / 2 - 3.1, cz = 0.9;
  P.push(cyl(cx, 0.2, cz, 1, 1.2, "#34373d", "walls", { size: [6.2, 1.2, 4.4] } as never));
  P.push(box(cx, 0.6, cz + 2.1, 3.2, 0.5, 0.08, "#9bb673", "windows", { mat: "emit", emissive: "#6b8a4b" }));
  P.push(dome(cx, 1.4, cz, 6.2, 2.3, 4.4, "#3b3f46", "roof"));
  P.push(dome(cx - 0.3, 3.55, cz - 0.1, 2.6, 0.35, 1.8, "#9ec3d6", "roof", { mat: "glass" }));
  // pavillon d'accueil vitré + enseigne
  P.push(box(-w / 2 + 1.4, 0.2, 1.1, 3.0, 1.9, 1.8, "#a9cfe6", "windows", { mat: "glass" }));
  P.push(box(-w / 2 + 1.4, 2.1, 1.1, 3.3, 0.14, 2.1, "#e8e6e0", "roof"));
  P.push(box(-w / 2 + 1.4, 1.55, 2.08, 2.6, 0.4, 0.08, "#ffffff", "sign", { mat: "sign", sign: "FÉDÉRATION FRANÇAISE\nDE JUDO" }));
  // mâts + drapeaux (bleu, blanc, rouge) et escalier
  [["#2f4c8a", 0], ["#f4f2ee", 0.7], ["#c1272d", 1.4]].forEach(([c, dx]) => {
    P.push(cyl(-w / 2 + 3.6 + (dx as number), 0.2, d / 2 + 0.9, 0.07, 3.0, "#c9c9c9", "props"));
    P.push(box(-w / 2 + 3.6 + (dx as number) + 0.24, 2.4, d / 2 + 0.9, 0.45, 0.3, 0.04, c as string, "props"));
  });
  for (let i = 0; i < 3; i++) P.push(box(-w / 2 + 1.4, 0.2 + i * 0.08, 2.0 + 0.3 * (2 - i), 2.4, 0.08, 0.3, "#c9c5bc", "foundation"));
  [[-w / 2 + 0.8, 3.3, "#2f3340"], [-w / 2 + 2.2, 3.5, "#34406e"], [cx - 2, 3.4, WHITE_GI], [cx - 0.8, 3.7, WHITE_GI]].forEach(([x, z, c]) => P.push(...person(x as number, 0.2, z as number, c as string, { s: 1 })));
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
  dojo, school, station, design, cfa, federation, dojoParis, tower, block, house, site, landmark,
};
