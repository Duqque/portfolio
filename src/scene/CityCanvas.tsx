"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import gsap from "gsap";
import { cameraApi } from "@/engine/cameraApi";
import { WORLD } from "@/data/infrastructure";
import * as THREE from "three";
import { buildings } from "@/data/buildings";
import { Building } from "./Building";
import { Terrain, Pond, Rails, Trees, Lamps, Beacons } from "./World";
import { Roads } from "./Roads";
import { Trace } from "./Trace";
import { Trains, Crowd, Cars } from "./Life";
import { Lighting } from "./Lighting";
import { getState, clock } from "@/engine/timeline";
import { buildT } from "@/engine/construction";

/* CAMÉRA LIBRE — glisser = orbite, clic droit / deux doigts = déplacement, boutons ou Ctrl+molette = zoom.
   La molette seule reste réservée au temps (scroll de la page). La cible est bornée au diorama. */
const DIR = new THREE.Vector3(1, 0.86, 1.08).normalize();
const LOOK = new THREE.Vector3(4, -1.5, 2.5);
const LOOK_PORTRAIT = new THREE.Vector3(9, -1.5, 3);

function Rig() {
  const { camera, size, gl } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);
  const home = useRef({ pos: new THREE.Vector3(), look: new THREE.Vector3(), dist: 150 });

  const place = useCallback((smooth: boolean) => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    const portrait = aspect < 1;
    const needH = portrait ? (118 / aspect) * 0.72 : Math.max(70, 118 / aspect);
    const dist = needH / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)));
    const look = (portrait ? LOOK_PORTRAIT : LOOK).clone();
    const pos = look.clone().addScaledVector(DIR, dist);
    home.current = { pos, look, dist };
    const c = controls.current;
    if (smooth && c) {
      gsap.to(cam.position, { x: pos.x, y: pos.y, z: pos.z, duration: 1.2, ease: "power2.inOut", onUpdate: () => c.update() });
      gsap.to(c.target, { x: look.x, y: look.y, z: look.z, duration: 1.2, ease: "power2.inOut" });
    } else {
      cam.position.copy(pos);
      if (c) c.target.copy(look);
      cam.lookAt(look);
    }
    cam.near = 4; cam.far = 1400;
    cam.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  useEffect(() => {
    // sur mobile, un doigt vertical fait défiler le temps ; l'orbite se fait en glissant horizontalement ou à deux doigts
    if (window.matchMedia("(pointer: coarse)").matches) gl.domElement.style.touchAction = "pan-y";
  }, [gl]);

  const moved = useRef(false);
  useEffect(() => { if (!moved.current) place(false); }, [place]);

  useEffect(() => {
    cameraApi.recenter = () => place(true);
    cameraApi.zoom = (f: number) => {
      const c = controls.current;
      if (!c) return;
      moved.current = true;
      const off = camera.position.clone().sub(c.target);
      const d = THREE.MathUtils.clamp(off.length() * f, 38, home.current.dist * 1.25);
      camera.position.copy(c.target).add(off.setLength(d));
      c.update();
    };
    const onWheel = (e: WheelEvent) => { if (e.ctrlKey) { e.preventDefault(); cameraApi.zoom(e.deltaY > 0 ? 1.1 : 0.9); } };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "+" || e.key === "=") cameraApi.zoom(0.85);
      if (e.key === "-") cameraApi.zoom(1.15);
      if (e.key === "0") cameraApi.recenter();
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("wheel", onWheel); window.removeEventListener("keydown", onKey); };
  }, [camera, place]);

  useFrame(() => {
    const c = controls.current;
    if (!c) return;
    // borne la cible au diorama
    c.target.x = THREE.MathUtils.clamp(c.target.x, WORLD.minX, WORLD.maxX);
    c.target.z = THREE.MathUtils.clamp(c.target.z, WORLD.minZ, WORLD.maxZ);
    c.target.y = THREE.MathUtils.clamp(c.target.y, -3, 12);
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableZoom={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.55}
      panSpeed={0.9}
      screenSpacePanning={false}
      minPolarAngle={0.3}
      maxPolarAngle={1.38}
      mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
      touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
      onStart={() => { moved.current = true; }}
    />
  );
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
      camera={{ fov: 22, near: 4, far: 1400 }}
      gl={{ antialias: !low, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; gl.shadowMap.type = THREE.PCFSoftShadowMap; gl.setClearColor(0x000000, 0); }}
      style={{ position: "fixed", inset: 0 }}
      aria-label="Ville en 3D qui se construit au fil du temps"
    >
      <Rig />
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
      <Beacons />
      <Projector />
      <CompletionWatcher />
    </Canvas>
  );
}
