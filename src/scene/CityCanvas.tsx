"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { buildings } from "@/data/buildings";
import { Building } from "./Building";
import { Terrain, Pond, Rails, Trees, Lamps } from "./World";
import { Roads } from "./Roads";
import { Trace } from "./Trace";
import { Trains, Crowd, Cars } from "./Life";
import { Lighting } from "./Lighting";
import { getState, clock } from "@/engine/timeline";
import { buildT } from "@/engine/construction";

/* CAMÉRA FIXE — position et cible constantes. Aucune interaction ne la modifie : seul le cadrage
   (distance) s'ajuste à la taille de la fenêtre pour que la ville entière reste visible. */
const DIR = new THREE.Vector3(1, 0.86, 1.08).normalize();
const LOOK = new THREE.Vector3(4, -1.5, 2.5);
const LOOK_PORTRAIT = new THREE.Vector3(9, -1.5, 3);

function FixedCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = 22;
    const aspect = size.width / size.height;
    // hauteur visible nécessaire pour embrasser tout le diorama (cadrage statique, recalculé au resize seulement)
    const portrait = aspect < 1;
    const needH = portrait ? (118 / aspect) * 0.72 : Math.max(70, 118 / aspect);
    const dist = needH / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)));
    const look = portrait ? LOOK_PORTRAIT : LOOK;
    cam.position.copy(look).addScaledVector(DIR, dist);
    cam.near = 40; cam.far = 900;
    cam.lookAt(look);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
  }, [camera, size.width, size.height]);
  return null;
}

/** Projette les ancres des bâtiments en coordonnées écran (pour les cartes HTML). */
function Projector() {
  const { camera, size } = useThree();
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const done = getState().completed;
    for (const id of done) {
      const b = buildings.find((x) => x.id === id);
      const el = document.getElementById(`card-${id}`);
      if (!b || !el) continue;
      v.set(b.position[0], b.size[2] + 1.4, b.position[2]).project(camera);
      el.style.setProperty("--lift", `${b.cardLift ?? 0}px`);
      el.style.setProperty("--dx", `${b.cardDx ?? 0}px`);
      el.style.transform = `translate3d(${((v.x + 1) / 2) * size.width}px, ${((1 - v.y) / 2) * size.height}px, 0)`;
    }
  });
  return null;
}

/** Détecte quels bâtiments sont à 100 % (cartes) — uniquement une fonction de progress. */
function CompletionWatcher() {
  const prev = useMemo(() => ({ key: "" }), []);
  useFrame(() => {
    const done = buildings.filter((b) => b.card && b.status !== "construction" && buildT(b, clock.progress) >= 1).map((b) => b.id);
    const key = done.join(",");
    if (key !== prev.key) { prev.key = key; import("@/engine/timeline").then((m) => m.setState({ completed: done })); }
  });
  return null;
}

export default function CityCanvas() {
  const low = getState().low;
  return (
    <Canvas
      shadows
      dpr={low ? [1, 1.25] : [1, 1.75]}
      camera={{ fov: 22, near: 40, far: 900 }}
      gl={{ antialias: !low, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; gl.shadowMap.type = THREE.PCFSoftShadowMap; gl.setClearColor(0x000000, 0); }}
      style={{ position: "fixed", inset: 0 }}
      aria-label="Ville en 3D qui se construit au fil du temps"
    >
      <FixedCamera />
      <Lighting />
      <Terrain />
      <Pond />
      <Rails />
      <Roads />
      <Trees />
      <Lamps />
      {buildings.map((b) => <Building key={b.id} def={b} />)}
      <Trains />
      <Crowd />
      <Cars />
      <Trace />
      <Projector />
      <CompletionWatcher />
    </Canvas>
  );
}
