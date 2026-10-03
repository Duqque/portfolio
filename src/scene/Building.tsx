"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { BuildingDef } from "@/data/types";
import { archetypes } from "./archetypes";
import { geometryFor } from "./geometries";
import { materialFor, glass } from "./materials";
import { buildT, stageT } from "@/engine/construction";
import { clock, getState } from "@/engine/timeline";
import { smoothstep } from "@/engine/math";
import type { Part } from "./parts";

const scafMat = new THREE.MeshStandardMaterial({ color: "#d4b46a", roughness: 0.9 });
const dummy = new THREE.Object3D();

/** Moteur de construction générique : tous les bâtiments passent ici, quelle que soit leur forme. */
export function Building({ def }: { def: BuildingDef }) {
  const group = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const scaf = useRef<THREE.InstancedMesh>(null);
  const last = useRef(-1);

  const parts = useMemo<Part[]>(() => {
    const all = archetypes[def.archetype](def);
    // allègement mobile : on retire les petits objets décoratifs
    return getState().low ? all.filter((p) => !(p.stage === "props" && p.size[1] < 1)) : all;
  }, [def]);

  // échafaudage : 4 poteaux + 3 niveaux de lisses
  const scafSpec = useMemo(() => {
    const [w, d, h] = def.size;
    const fw = w + 1.8, fd = d + 1.8, H = Math.max(h, 2.6);
    const s: { p: [number, number, number]; s: [number, number, number] }[] = [];
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) s.push({ p: [x * fw / 2, 0, z * fd / 2], s: [0.1, H, 0.1] });
    for (const lv of [0.35, 0.65, 0.95]) {
      s.push({ p: [0, H * lv, fd / 2], s: [fw, 0.07, 0.07] }, { p: [0, H * lv, -fd / 2], s: [fw, 0.07, 0.07] },
        { p: [fw / 2, H * lv, 0], s: [0.07, 0.07, fd] }, { p: [-fw / 2, H * lv, 0], s: [0.07, 0.07, fd] });
    }
    return s;
  }, [def]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const bt = buildT(def, clock.progress);
    if (bt === last.current) return;
    last.current = bt;
    g.visible = bt > 0.0005;
    if (!g.visible) return;
    for (let i = 0; i < parts.length; i++) {
      const m = meshes.current[i];
      if (!m) continue;
      const pt = parts[i];
      const t = stageT(pt.stage, bt - (pt.delay ?? 0));
      if (t <= 0.002) { m.visible = false; continue; }
      m.visible = true;
      if (pt.grow === "all") m.scale.set(pt.size[0] * t, pt.size[1] * t, pt.size[2] * t);
      else m.scale.set(pt.size[0], Math.max(pt.size[1] * t, 0.001), pt.size[2]);
    }
    const sc = scaf.current;
    if (sc) {
      const amt = smoothstep(0.06, 0.3, bt) * (1 - smoothstep(0.8, 0.94, bt)) * (def.status === "construction" ? 1 : 1);
      sc.visible = amt > 0.01;
      if (sc.visible) {
        scafSpec.forEach((s, i) => {
          const pole = s.s[1] > 1;
          dummy.position.set(s.p[0], pole ? 0.2 + (s.s[1] * amt) / 2 : 0.2 + s.p[1] * amt, s.p[2]);
          dummy.scale.set(s.s[0], pole ? s.s[1] * amt : s.s[1], s.s[2]);
          dummy.updateMatrix();
          sc.setMatrixAt(i, dummy.matrix);
        });
        sc.instanceMatrix.needsUpdate = true;
      }
    }
  });

  return (
    <group ref={group} position={def.position} rotation={[0, def.rotationY ?? 0, 0]} visible={false}>
      {parts.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => { meshes.current[i] = el; }}
          geometry={geometryFor(p.shape)}
          material={materialFor(p)}
          position={p.pos}
          rotation={[p.rotX ?? 0, p.rotY ?? 0, p.rotZ ?? 0, "YZX"]}
          castShadow={p.mat !== "glass" && p.size[1] > 0.12}
          receiveShadow
          visible={false}
          renderOrder={materialFor(p) === glass ? 2 : 0}
        />
      ))}
      <instancedMesh ref={scaf} args={[undefined, undefined, scafSpec.length]} material={scafMat} visible={false} castShadow frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
    </group>
  );
}
