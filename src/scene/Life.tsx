"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cars, walkers, trains, trainX, RAIL_Z, streetBuiltX } from "@/data/infrastructure";
import { clock, getState } from "@/engine/timeline";
import { smoothstep } from "@/engine/math";
import { materialFor } from "./materials";
import { sky } from "@/engine/daynight";
import { box } from "./parts";

/* ───── Trains : position = fonction pure de progress (réversible), le monde bouge, pas la caméra ───── */
const loco = materialFor(box(0, 0, 0, 1, 1, 1, "#e9e9ea", "props"));
const stripe = materialFor(box(0, 0, 0, 1, 1, 1, "#7747FF", "props", { mat: "emit", emissive: "#7747FF" }));
const dark = materialFor(box(0, 0, 0, 1, 1, 1, "#2f3340", "props"));
const winMat = materialFor(box(0, 0, 0, 1, 1, 1, "#9fc2da", "props", { mat: "window" }));
const headlight = materialFor(box(0, 0, 0, 1, 1, 1, "#fff4cc", "props", { mat: "emit", emissive: "#ffe9a8" }));

function TrainMesh({ index }: { index: number }) {
  const g = useRef<THREE.Group>(null);
  const sched = trains[index];
  useFrame(() => {
    const x = trainX(sched, clock.progress);
    const grp = g.current;
    if (!grp) return;
    grp.visible = x !== null;
    if (x !== null) grp.position.set(x, 0.3, RAIL_Z[0]);
  });
  // 1 motrice (tête, +x) + 3 voitures
  const carLen = 3.5, gap = 0.18;
  const elements = [
    { x: 5.9, len: 3.2, head: true },
    { x: 5.9 - 3.2 / 2 - gap - carLen / 2, len: carLen },
    { x: 5.9 - 3.2 / 2 - gap - carLen * 1.5 - gap, len: carLen },
    { x: 5.9 - 3.2 / 2 - gap - carLen * 2.5 - gap * 2, len: carLen },
  ];
  return (
    <group ref={g} visible={false}>
      {elements.map((e, i) => (
        <group key={i} position={[e.x - 3.8, 0, 0]}>
          <mesh material={dark} position={[0, 0.15, 0]} castShadow><boxGeometry args={[e.len - 0.2, 0.3, 1.5]} /></mesh>
          <mesh material={loco} position={[0, 1.15, 0]} castShadow receiveShadow><boxGeometry args={[e.len, 1.5, 2]} /></mesh>
          <mesh material={stripe} position={[0, 0.78, 0]}><boxGeometry args={[e.len + 0.02, 0.14, 2.03]} /></mesh>
          {!e.head && [-1, 1].map((s) => (
            <mesh key={s} material={winMat} position={[0, 1.4, s * 1.02]}><boxGeometry args={[e.len - 0.5, 0.5, 0.05]} /></mesh>
          ))}
          {e.head && (
            <>
              <mesh material={winMat} position={[e.len / 2 + 0.01, 1.4, 0]}><boxGeometry args={[0.06, 0.55, 1.5]} /></mesh>
              <mesh material={headlight} position={[e.len / 2 + 0.02, 0.95, 0.6]}><boxGeometry args={[0.06, 0.2, 0.25]} /></mesh>
              <mesh material={headlight} position={[e.len / 2 + 0.02, 0.95, -0.6]}><boxGeometry args={[0.06, 0.2, 0.25]} /></mesh>
            </>
          )}
        </group>
      ))}
    </group>
  );
}
export const Trains = () => <>{trains.map((_, i) => <TrainMesh key={i} index={i} />)}</>;

/* ───── Habitants : instanciés, ils apparaissent quand leur rue existe ───── */
export function Crowd() {
  const bodies = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  const bags = useRef<THREE.InstancedMesh>(null);
  const list = useMemo(() => {
    const w = walkers.map((w) => {
      const lens = w.path.slice(1).map((p, i) => Math.hypot(p[0] - w.path[i][0], p[1] - w.path[i][1]));
      return { ...w, lens, total: lens.reduce((a, b) => a + b, 0) };
    });
    return getState().low ? w.filter((_, i) => i % 2 === 0) : w;
  }, []);
  const o = useMemo(() => new THREE.Object3D(), []);
  const colored = useRef(false);
  const dist = useRef<number[]>([]);
  const lastT = useRef(0);
  useFrame(() => {
    const B = bodies.current, H = heads.current, G = bags.current;
    if (!B || !H || !G) return;
    if (!colored.current) {
      list.forEach((w, i) => B.setColorAt(i, new THREE.Color(w.color)));
      B.instanceColor!.needsUpdate = true;
      colored.current = true;
    }
    const dt = Math.min(0.1, clock.time - lastT.current);
    lastT.current = clock.time;
    const p = clock.progress;
    list.forEach((w, i) => {
      dist.current[i] = (dist.current[i] ?? w.offset * w.total * 2) + w.speed * clock.life * dt * 0.9;
      const k = smoothstep(w.appearAt, w.appearAt + 0.012, p);
      const s = Math.max(k, 0.0001);
      // aller-retour sur le tracé
      const m = dist.current[i] % (w.total * 2);
      let d = m < w.total ? m : w.total * 2 - m;
      let x = w.path[0][0], z = w.path[0][1], dx = 1, dz = 0;
      for (let j = 0; j < w.lens.length; j++) {
        if (d <= w.lens[j] || j === w.lens.length - 1) {
          const t = Math.min(1, d / (w.lens[j] || 1));
          x = w.path[j][0] + (w.path[j + 1][0] - w.path[j][0]) * t;
          z = w.path[j][1] + (w.path[j + 1][1] - w.path[j][1]) * t;
          dx = w.path[j + 1][0] - w.path[j][0]; dz = w.path[j + 1][1] - w.path[j][1];
          break;
        }
        d -= w.lens[j];
      }
      const bob = Math.abs(Math.sin(clock.time * 7 * w.speed)) * 0.04 * clock.life;
      o.position.set(x, 0.12 + bob, z); o.rotation.set(0, Math.atan2(dx, dz), 0); o.scale.set(s, s, s); o.updateMatrix(); B.setMatrixAt(i, o.matrix);
      o.position.set(x, 0.12 + 0.46 * s + bob, z); o.updateMatrix(); H.setMatrixAt(i, o.matrix);
      const bs = w.bag ? s : 0.0001;
      o.position.set(x + Math.cos(Math.atan2(dx, dz)) * 0.2, 0.2 + bob, z - Math.sin(Math.atan2(dx, dz)) * 0.2); o.scale.set(bs, bs, bs); o.updateMatrix(); G.setMatrixAt(i, o.matrix);
    });
    B.instanceMatrix.needsUpdate = H.instanceMatrix.needsUpdate = G.instanceMatrix.needsUpdate = true;
  });
  const n = list.length;
  return (
    <group>
      <instancedMesh ref={bodies} args={[undefined, undefined, n]} castShadow frustumCulled={false}>
        <cylinderGeometry args={[0.15, 0.17, 0.46, 8]} /><meshStandardMaterial flatShading />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, n]} castShadow frustumCulled={false}>
        <sphereGeometry args={[0.12, 8, 6]} /><meshStandardMaterial color="#e6b894" flatShading />
      </instancedMesh>
      <instancedMesh ref={bags} args={[undefined, undefined, n]} frustumCulled={false}>
        <boxGeometry args={[0.1, 0.3, 0.24]} /><meshStandardMaterial color="#2f3340" />
      </instancedMesh>
    </group>
  );
}

/* ───── Voitures sur la rue principale (la portion construite uniquement) ───── */
export function Cars() {
  const bodies = useRef<THREE.InstancedMesh>(null);
  const cabins = useRef<THREE.InstancedMesh>(null);
  const lights = useRef<THREE.InstancedMesh>(null);
  const o = useMemo(() => new THREE.Object3D(), []);
  const colored = useRef(false);
  const dist = useRef<number[]>([]);
  const lastT = useRef(0);
  useFrame(() => {
    const B = bodies.current, C = cabins.current, L = lights.current;
    if (!B || !C || !L) return;
    if (!colored.current) { cars.forEach((c, i) => B.setColorAt(i, new THREE.Color(c.color))); B.instanceColor!.needsUpdate = true; colored.current = true; }
    const dt = Math.min(0.1, clock.time - lastT.current);
    lastT.current = clock.time;
    const p = clock.progress;
    const xmin = -30, xmax = Math.min(streetBuiltX(p) - 1, 35);
    const range = xmax - xmin;
    cars.forEach((c, i) => {
      dist.current[i] = (dist.current[i] ?? c.offset * 60) + c.speed * clock.life * dt;
      const ok = range > 10 ? smoothstep(c.appearAt, c.appearAt + 0.01, p) : 0;
      const s = Math.max(ok, 0.0001);
      const u = (dist.current[i] % range + range) % range;
      const x = c.dir === 1 ? xmin + u : xmax - u;
      o.rotation.set(0, c.dir === 1 ? 0 : Math.PI, 0); o.scale.set(s, s, s);
      o.position.set(x, 0.3 * s, c.lane); o.updateMatrix(); B.setMatrixAt(i, o.matrix);
      o.position.set(x - c.dir * 0.05, 0.65 * s, c.lane); o.updateMatrix(); C.setMatrixAt(i, o.matrix);
      o.position.set(x + c.dir * 0.76, 0.32 * s, c.lane); o.updateMatrix(); L.setMatrixAt(i, o.matrix);
    });
    B.instanceMatrix.needsUpdate = C.instanceMatrix.needsUpdate = L.instanceMatrix.needsUpdate = true;
    (L.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2 + sky.night * 3;
  });
  const n = cars.length;
  return (
    <group>
      <instancedMesh ref={bodies} args={[undefined, undefined, n]} castShadow frustumCulled={false}>
        <boxGeometry args={[1.5, 0.4, 0.75]} /><meshStandardMaterial flatShading roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={cabins} args={[undefined, undefined, n]} castShadow frustumCulled={false}>
        <boxGeometry args={[0.8, 0.3, 0.66]} /><meshStandardMaterial color="#cfe0ea" roughness={0.2} />
      </instancedMesh>
      <instancedMesh ref={lights} args={[undefined, undefined, n]} frustumCulled={false}>
        <boxGeometry args={[0.04, 0.12, 0.62]} /><meshStandardMaterial color="#fff2cc" emissive="#ffd88a" emissiveIntensity={0.2} />
      </instancedMesh>
    </group>
  );
}
