"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import gsap from "gsap";
import { cameraApi } from "@/engine/cameraApi";
import { WORLD, ISLAND_BOUNDS } from "@/data/infrastructure";
import { story } from "@/data/buildings";
import { smoothstep } from "@/engine/math";
import * as THREE from "three";
import { buildings } from "@/data/buildings";
import { Building } from "./Building";
import { Terrain, Ocean, Pond, Rails, Trees, Lamps, Beacons } from "./World";
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
// vue d'ensemble de l'île (intro / rewind) : presque à la verticale, comme une carte de monde ouvert
const DIR_ISLAND = new THREE.Vector3(0.38, 1.35, 0.72).normalize();
const LOOK_ISLAND = new THREE.Vector3(-6, 0, 2);

function Rig() {
  const { camera, size, gl } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);
  const home = useRef({ pos: new THREE.Vector3(), look: new THREE.Vector3(), dist: 150 });

  const mode = useRef<"island" | "city">("island");
  const place = useCallback((smooth: boolean, m: "island" | "city" = mode.current) => {
    mode.current = m;
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    const portrait = aspect < 1;
    let look: THREE.Vector3, dir: THREE.Vector3, dist: number;
    if (m === "island") {
      const needH = portrait ? (210 / aspect) * 0.7 : Math.max(125, 215 / aspect);
      dist = needH / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)));
      look = LOOK_ISLAND.clone(); dir = DIR_ISLAND;
    } else {
      const needH = portrait ? (118 / aspect) * 0.72 : Math.max(70, 118 / aspect);
      dist = needH / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)));
      look = (portrait ? LOOK_PORTRAIT : LOOK).clone(); dir = DIR;
    }
    const pos = look.clone().addScaledVector(dir, dist);
    home.current = { pos, look, dist };
    const c = controls.current;
    if (smooth && c) {
      gsap.killTweensOf(cam.position); gsap.killTweensOf(c.target);
      gsap.to(cam.position, { x: pos.x, y: pos.y, z: pos.z, duration: 2.4, ease: "power3.inOut", onUpdate: () => c.update() });
      gsap.to(c.target, { x: look.x, y: look.y, z: look.z, duration: 2.4, ease: "power3.inOut" });
    } else {
      cam.position.copy(pos);
      if (c) c.target.copy(look);
      cam.lookAt(look);
    }
    cam.near = 4; cam.far = 2600;
    cam.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  useEffect(() => {
    // sur mobile, un doigt vertical fait défiler le temps ; l'orbite se fait en glissant horizontalement ou à deux doigts
    if (window.matchMedia("(pointer: coarse)").matches) gl.domElement.style.touchAction = "pan-y";
  }, [gl]);

  const moved = useRef(false);
  useEffect(() => { if (!moved.current) place(false); }, [place]);

  // la caméra quitte la vue d'ensemble de l'île dès que le temps commence à s'écouler
  const phaseSeen = useRef("");
  useFrame(() => {
    const ph = getState().phase;
    if (ph === phaseSeen.current) return;
    phaseSeen.current = ph;
    const wanted = ph === "scroll" || ph === "void" ? "city" : "island";
    if (wanted !== mode.current) place(true, wanted);
  });

  useEffect(() => {
    cameraApi.recenter = () => place(true);
    cameraApi.zoom = (f: number) => {
      const c = controls.current;
      if (!c) return;
      moved.current = true; lastTouch.current = clock.time;
      const off = camera.position.clone().sub(c.target);
      const d = THREE.MathUtils.clamp(off.length() * f, 30, mode.current === "island" ? 520 : home.current.dist * 1.25);
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

  const lastTouch = useRef(-99);
  useFrame((_, dt) => {
    const c = controls.current;
    if (!c) return;
    // ── FOCUS : quand un bâtiment se construit, la caméra se rapproche de lui (fonction de progress), puis revient
    const st = getState();
    if (st.phase === "scroll" && !st.openId && clock.time - lastTouch.current > 3.5 && !gsap.isTweening(camera.position)) {
      const p = clock.progress;
      let best: (typeof story)[number] | null = null, w = 0;
      for (const b of story) {
        const k = smoothstep(b.buildStart - 0.005, b.buildStart + 0.003, p) * (1 - smoothstep(b.buildEnd + 0.002, b.buildEnd + 0.012, p));
        if (k > w) { w = k; best = b; }
      }
      const h = home.current;
      const tgt = best ? h.look.clone().lerp(new THREE.Vector3(best.position[0], 1.5, best.position[2]), w) : h.look;
      const off = camera.position.clone().sub(c.target);
      const dir = off.clone().normalize();
      const wantDist = THREE.MathUtils.lerp(h.dist, 56, w);
      const k = 1 - Math.exp(-dt * 2.2);
      c.target.lerp(tgt, k);
      const d = THREE.MathUtils.lerp(off.length(), wantDist, k);
      camera.position.copy(c.target).addScaledVector(dir, d);
    }
    // borne la cible au diorama
    c.target.x = THREE.MathUtils.clamp(c.target.x, ISLAND_BOUNDS.minX, ISLAND_BOUNDS.maxX);
    c.target.z = THREE.MathUtils.clamp(c.target.z, ISLAND_BOUNDS.minZ, ISLAND_BOUNDS.maxZ);
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
      onStart={() => { moved.current = true; lastTouch.current = clock.time; }}
      onEnd={() => { lastTouch.current = clock.time; }}
    />
  );
}

/** Projette les repères en coordonnées écran et empile les labels pour qu'ils ne se chevauchent pas. */
function Projector() {
  const { camera, size } = useThree();
  const v = useMemo(() => new THREE.Vector3(), []);
  const byId = useMemo(() => Object.fromEntries(buildings.map((b) => [b.id, b])), []);
  useFrame(() => {
    const done = getState().completed;
    const items: { id: string; x: number; y: number; w: number; el: HTMLElement }[] = [];
    for (const id of done) {
      const b = byId[id];
      const el = document.getElementById(`card-${id}`);
      if (!b || !el) continue;
      v.set(b.position[0], 0.3, b.position[2]).project(camera);
      const x = ((v.x + 1) / 2) * size.width, y = ((1 - v.y) / 2) * size.height;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      items.push({ id, x, y, w: 64 + b.name.length * 9.5, el });
    }
    // du plus proche (bas de l'écran) au plus loin : chaque label monte jusqu'à trouver une place libre
    items.sort((a, b) => b.y - a.y);
    const placed: [number, number, number, number][] = [];
    for (const it of items) {
      let lift = 30;
      for (let k = 0; k < 14; k++) {
        const r: [number, number, number, number] = [it.x - it.w / 2, it.y - lift - 28, it.x + it.w / 2, it.y - lift];
        if (!placed.some((p) => r[0] < p[2] && r[2] > p[0] && r[1] < p[3] && r[3] > p[1])) { placed.push(r); break; }
        lift += 30;
        if (k === 13) placed.push(r);
      }
      it.el.style.setProperty("--lift", `${lift}px`);
      it.el.style.setProperty("--dx", "0px");
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
      camera={{ fov: 22, near: 4, far: 2600 }}
      gl={{ antialias: !low, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; gl.shadowMap.type = THREE.PCFSoftShadowMap; gl.setClearColor(0x000000, 0); }}
      style={{ position: "fixed", inset: 0 }}
      aria-label="Ville en 3D qui se construit au fil du temps"
    >
      <Rig />
      <Lighting />
      <Terrain />
      <Ocean />
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
