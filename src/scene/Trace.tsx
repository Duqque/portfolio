"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { traceSegments, traceNodes } from "@/data/infrastructure";
import { buildingById } from "@/data/buildings";
import { clock, getState } from "@/engine/timeline";
import { invLerp, smoothstep } from "@/engine/math";
import { buildT } from "@/engine/construction";
import { glowSprite } from "./textures";

const TRACE_Y = 0.32;
const ACCENT = new THREE.Color("#7747FF");
const NET = new THREE.Color("#b79dff");
const N = 90;

/** Polyligne aux angles arrondis, échantillonnée en N points (longueur-uniforme). */
function roundedPath(pts: [number, number, number?][], radius = 1.1): THREE.Vector3[] {
  const v = pts.map((p) => new THREE.Vector3(p[0], p[2] ?? TRACE_Y, p[1]));
  const out: THREE.Vector3[] = [v[0]];
  for (let i = 1; i < v.length - 1; i++) {
    const a = v[i - 1], b = v[i], c = v[i + 1];
    const r = Math.min(radius, a.distanceTo(b) / 2, b.distanceTo(c) / 2);
    const p0 = b.clone().add(a.clone().sub(b).normalize().multiplyScalar(r));
    const p2 = b.clone().add(c.clone().sub(b).normalize().multiplyScalar(r));
    const q = new THREE.QuadraticBezierCurve3(p0, b, p2);
    out.push(...q.getPoints(6));
  }
  out.push(v[v.length - 1]);
  const curve = new THREE.CatmullRomCurve3(out, false, "catmullrom", 0);
  return curve.getSpacedPoints(N);
}

function ribbonGeometry(points: THREE.Vector3[], width: number) {
  const pos = new Float32Array(points.length * 2 * 3);
  const idx: number[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[Math.max(0, i - 1)], b = points[Math.min(points.length - 1, i + 1)];
    const dir = b.clone().sub(a);
    const nx = -dir.z, nz = dir.x;
    const l = Math.hypot(nx, nz) || 1;
    const ox = (nx / l) * width, oz = (nz / l) * width;
    pos.set([points[i].x + ox, points[i].y, points[i].z + oz, points[i].x - ox, points[i].y, points[i].z - oz], i * 6);
    if (i < points.length - 1) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

/** La trace violette : chemin de vie (pas une distance géographique). Se déploie avec `progress`, ne disparaît jamais. */
export function Trace() {
  const segs = useMemo(() => traceSegments.map((s) => {
    const net = s.kind === "network";
    const pts = net
      ? new THREE.CatmullRomCurve3(s.points.map((p) => new THREE.Vector3(p[0], p[2] ?? TRACE_Y, p[1]))).getSpacedPoints(N)
      : roundedPath(s.points);
    return { def: s, pts, core: ribbonGeometry(pts, net ? 0.1 : 0.17), halo: ribbonGeometry(pts, net ? 0.26 : 0.55), net };
  }), []);
  const cores = useRef<(THREE.Mesh | null)[]>([]);
  const halos = useRef<(THREE.Mesh | null)[]>([]);
  const heads = useRef<(THREE.Mesh | null)[]>([]);
  const pulses = useRef<THREE.InstancedMesh>(null);
  const nodeRings = useRef<(THREE.Group | null)[]>([]);
  const o = useMemo(() => new THREE.Object3D(), []);
  const sprite = useMemo(() => glowSprite(), []);
  const reduced = getState().reduced;

  useFrame(() => {
    const p = clock.progress, time = clock.time;
    let pi = 0;
    segs.forEach((s, i) => {
      const t = invLerp(s.def.start, s.def.end, p);
      const count = Math.floor(t * N);
      const core = cores.current[i], halo = halos.current[i], head = heads.current[i];
      if (core && halo) {
        core.visible = halo.visible = count > 1;
        core.geometry.setDrawRange(0, Math.max(0, count - 1) * 6);
        halo.geometry.setDrawRange(0, Math.max(0, count - 1) * 6);
        const pulse = reduced ? 0.85 : 0.75 + Math.sin(time * 2.2 + i) * 0.2;
        (halo.material as THREE.MeshBasicMaterial).opacity = (s.net ? 0.18 : 0.26) * pulse + 0.1 * (1 - smoothstep(0, 0.15, Math.abs(t - 0.5) * 2));
      }
      if (head) {
        const drawing = t > 0.002 && t < 0.998;
        head.visible = drawing;
        if (drawing) { const q = s.pts[Math.min(N, count)]; head.position.set(q.x, q.y + 0.12, q.z); }
      }
      // particules qui courent le long des segments terminés
      if (t >= 0.999 && pulses.current && !reduced) {
        for (let k = 0; k < 2 && pi < 120; k++, pi++) {
          const u = (time * 0.07 + k * 0.5 + i * 0.173) % 1;
          const q = s.pts[Math.floor(u * N)];
          o.position.set(q.x, q.y + 0.18, q.z);
          const sc = 0.2 + 0.1 * Math.sin(time * 5 + k + i);
          o.scale.set(sc, sc, sc); o.updateMatrix();
          pulses.current.setMatrixAt(pi, o.matrix);
        }
      }
    });
    if (pulses.current) {
      for (let k = pi; k < 120; k++) { o.scale.set(0, 0, 0); o.updateMatrix(); pulses.current.setMatrixAt(k, o.matrix); }
      pulses.current.instanceMatrix.needsUpdate = true;
    }
    // marqueurs aux étapes
    traceNodes.forEach((id, i) => {
      const g = nodeRings.current[i];
      if (!g) return;
      const def = buildingById[id];
      const k = smoothstep(0.9, 1, buildT(def, p));
      g.visible = k > 0.01;
      const s = k * (1 + (reduced ? 0 : Math.sin(time * 2.4 + i) * 0.08));
      g.scale.set(s, s, s);
    });
  });

  return (
    <group>
      {segs.map((s, i) => (
        <group key={s.def.id}>
          <mesh ref={(el) => { halos.current[i] = el; }} geometry={s.halo} visible={false} renderOrder={5}>
            <meshBasicMaterial color={s.net ? NET : ACCENT} transparent opacity={0.25} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh ref={(el) => { cores.current[i] = el; }} geometry={s.core} visible={false} renderOrder={6}>
            <meshBasicMaterial color={s.net ? NET : ACCENT} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh ref={(el) => { heads.current[i] = el; }} visible={false} renderOrder={7}>
            <sphereGeometry args={[0.32, 10, 8]} /><meshBasicMaterial color="#c9b6ff" toneMapped={false} />
          </mesh>
        </group>
      ))}
      <instancedMesh ref={pulses} args={[undefined, undefined, 120]} frustumCulled={false} renderOrder={8}>
        <sphereGeometry args={[1, 8, 6]} /><meshBasicMaterial color="#d9ccff" toneMapped={false} />
      </instancedMesh>
      {traceNodes.map((id, i) => {
        const a = buildingById[id].anchor;
        return (
          <group key={id} ref={(el) => { nodeRings.current[i] = el; }} position={[a[0], TRACE_Y, a[1]]} visible={false}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={6}>
              <ringGeometry args={[0.42, 0.6, 24]} /><meshBasicMaterial color={ACCENT} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 1.3, 0]} renderOrder={4}>
              <cylinderGeometry args={[0.04, 0.34, 2.6, 8, 1, true]} />
              <meshBasicMaterial color={ACCENT} transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
            <sprite position={[0, 0.3, 0]} scale={[2.6, 2.6, 1]} renderOrder={4}>
              <spriteMaterial map={sprite} color={ACCENT} transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
            </sprite>
          </group>
        );
      })}
    </group>
  );
}
