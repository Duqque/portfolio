"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { roads } from "@/data/infrastructure";
import { clock } from "@/engine/timeline";
import { invLerp } from "@/engine/math";

interface Seg { len: number; ang: number; x0: number; z0: number; t0: number; t1: number; w: number; road: number }

/** Les routes se tracent segment par segment, du début à la fin de leur fenêtre de temps. */
export function Roads() {
  const asphalt = useRef<(THREE.Mesh | null)[]>([]);
  const line = useRef<(THREE.Mesh | null)[]>([]);
  const walk = useRef<(THREE.Mesh | null)[]>([]);
  const segs = useMemo(() => {
    const out: Seg[] = [];
    roads.forEach((r, ri) => {
      const lens = r.points.slice(1).map((p, i) => Math.hypot(p[0] - r.points[i][0], p[1] - r.points[i][1]));
      const total = lens.reduce((a, b) => a + b, 0);
      let acc = 0;
      lens.forEach((L, i) => {
        const [x0, z0] = r.points[i], [x1, z1] = r.points[i + 1];
        out.push({ len: L, ang: Math.atan2(z1 - z0, x1 - x0), x0, z0, t0: acc / total, t1: (acc + L) / total, w: r.width, road: ri });
        acc += L;
      });
    });
    return out;
  }, []);
  const last = useRef(-1);
  useFrame(() => {
    const p = clock.progress;
    if (p === last.current) return;
    last.current = p;
    segs.forEach((s, i) => {
      const r = roads[s.road];
      const t = invLerp(s.t0, s.t1, invLerp(r.start, r.end, p));
      for (const ref of [asphalt, line, walk]) {
        const m = ref.current[i];
        if (!m) continue;
        m.visible = t > 0.001;
        m.scale.x = Math.max(s.len * t, 0.001);
        const x = s.x0 + Math.cos(s.ang) * s.len * t * 0.5, z = s.z0 + Math.sin(s.ang) * s.len * t * 0.5;
        m.position.x = x; m.position.z = z;
      }
    });
  });
  return (
    <group>
      {segs.map((s, i) => (
        <group key={i}>
          <mesh ref={(el) => { walk.current[i] = el; }} position={[s.x0, 0.035, s.z0]} rotation={[0, -s.ang, 0]} receiveShadow visible={false}>
            <boxGeometry args={[1, 0.07, s.w + 0.9]} /><meshStandardMaterial color="#cfc9bb" roughness={1} />
          </mesh>
          <mesh ref={(el) => { asphalt.current[i] = el; }} position={[s.x0, 0.06, s.z0]} rotation={[0, -s.ang, 0]} receiveShadow visible={false}>
            <boxGeometry args={[1, 0.07, s.w]} /><meshStandardMaterial color="#4a4d56" roughness={0.95} />
          </mesh>
          {s.w > 2 && (
            <mesh ref={(el) => { line.current[i] = el; }} position={[s.x0, 0.1, s.z0]} rotation={[0, -s.ang, 0]} visible={false}>
              <boxGeometry args={[1, 0.02, 0.07]} /><meshStandardMaterial color="#e9e3cf" roughness={1} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}
