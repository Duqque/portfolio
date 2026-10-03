"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { POND, WORLD, RAIL_Z, makeLamps, streetBuiltX, makeTrees } from "@/data/infrastructure";
import { clock, getState } from "@/engine/timeline";
import { sky } from "@/engine/daynight";
import { rng, smoothstep } from "@/engine/math";
import { glowSprite } from "./textures";

const W = WORLD.maxX - WORLD.minX, D = WORLD.maxZ - WORLD.minZ;
const CX = (WORLD.maxX + WORLD.minX) / 2, CZ = (WORLD.maxZ + WORLD.minZ) / 2;

/** Le diorama : dalle de terrain (herbe, terre, roche), étang, et ombre portée sur la « table ». */
export function Terrain() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(W, D, Math.round(W / 2.2), Math.round(D / 2.2));
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    const col = new Float32Array(pos.count * 3);
    const r = rng(8);
    const base = new THREE.Color("#8eaa6b"), alt = new THREE.Color("#a3b87a"), dry = new THREE.Color("#b3b27c");
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const n = Math.sin(x * 0.17) * Math.cos(z * 0.13) + Math.sin(x * 0.05 + z * 0.09) * 0.8 + (r() - 0.5) * 0.5;
      c.copy(base).lerp(alt, THREE.MathUtils.clamp(n * 0.5 + 0.4, 0, 1)).lerp(dry, THREE.MathUtils.clamp(n * 0.3 - 0.1, 0, 0.5));
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g.toNonIndexed();
  }, []);
  return (
    <group position={[CX, 0, CZ]}>
      <mesh geometry={geo} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial vertexColors flatShading roughness={1} />
      </mesh>
      <mesh position={[0, -1.05, 0]} receiveShadow castShadow>
        <boxGeometry args={[W, 1.8, D]} />
        <meshStandardMaterial color="#8a6a4e" roughness={1} />
      </mesh>
      <mesh position={[0, -2.8, 0]} receiveShadow>
        <boxGeometry args={[W - 0.8, 2.2, D - 0.8]} />
        <meshStandardMaterial color="#5a5a68" roughness={1} />
      </mesh>
      <mesh position={[0, -4.6, 0]}>
        <boxGeometry args={[W - 3, 1.6, D - 3]} />
        <meshStandardMaterial color="#3a3a46" roughness={1} />
      </mesh>
    </group>
  );
}

export function Pond() {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    if (mat.current) {
      mat.current.color.set("#6faed2").lerp(sky.bottom, 0.25);
      mat.current.emissive.set("#1a2c52").multiplyScalar(sky.night);
      mat.current.emissiveIntensity = 0.4 * sky.night;
    }
  });
  return (
    <group position={[POND.x, 0, POND.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} scale={[POND.rx + 0.6, POND.rz + 0.6, 1]}>
        <circleGeometry args={[1, 20]} />
        <meshStandardMaterial color="#c9bd98" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} scale={[POND.rx, POND.rz, 1]} receiveShadow>
        <circleGeometry args={[1, 20]} />
        <meshStandardMaterial ref={mat} color="#6faed2" roughness={0.2} metalness={0.3} />
      </mesh>
    </group>
  );
}

/** Voie ferrée présente dès le terrain vide : « une voie ferrée au loin ». */
export function Rails() {
  const ties = useRef<THREE.InstancedMesh>(null);
  useMemo(() => null, []);
  const count = Math.floor((WORLD.maxX - WORLD.minX) / 0.9);
  useFrame(() => {
    const t = ties.current;
    if (!t || (t.userData as { done?: boolean }).done) return;
    const o = new THREE.Object3D();
    let i = 0;
    for (const z of RAIL_Z) for (let k = 0; k < count; k++) {
      o.position.set(WORLD.minX + 0.6 + k * 0.9, 0.09, z);
      o.updateMatrix();
      t.setMatrixAt(i++, o.matrix);
    }
    t.instanceMatrix.needsUpdate = true;
    (t.userData as { done?: boolean }).done = true;
  });
  const len = WORLD.maxX - WORLD.minX;
  return (
    <group>
      {RAIL_Z.map((z) => (
        <group key={z} position={[CX, 0, z]}>
          <mesh position={[0, 0.05, 0]} receiveShadow><boxGeometry args={[len, 0.1, 2.3]} /><meshStandardMaterial color="#8c8577" roughness={1} /></mesh>
          {[-0.6, 0.6].map((dz) => (<mesh key={dz} position={[0, 0.2, dz]} castShadow><boxGeometry args={[len, 0.1, 0.1]} /><meshStandardMaterial color="#8d9299" metalness={0.6} roughness={0.4} /></mesh>))}
        </group>
      ))}
      <instancedMesh ref={ties} args={[undefined, undefined, count * RAIL_Z.length]} receiveShadow>
        <boxGeometry args={[0.3, 0.09, 2]} />
        <meshStandardMaterial color="#5b4a3a" roughness={1} />
      </instancedMesh>
    </group>
  );
}

/** Arbres : instanciés, ils poussent avec la progression (certains existent dès le terrain vide). */
export function Trees() {
  const trunks = useRef<THREE.InstancedMesh>(null);
  const crowns = useRef<THREE.InstancedMesh>(null);
  const crowns2 = useRef<THREE.InstancedMesh>(null);
  const trees = useMemo(() => {
    const all = makeTrees();
    return getState().low ? all.filter((_, i) => i % 2 === 0 || i < 34) : all;
  }, []);
  const last = useRef(-1);
  const o = useMemo(() => new THREE.Object3D(), []);
  const colored = useRef(false);
  useFrame(() => {
    const T = trunks.current, C = crowns.current, C2 = crowns2.current;
    if (!T || !C || !C2) return;
    if (!colored.current) {
      const c = new THREE.Color();
      trees.forEach((t, i) => {
        c.set("#4f7d45").lerp(new THREE.Color("#86a553"), t.tone);
        C.setColorAt(i, c);
        c.set("#5e8c4c").lerp(new THREE.Color("#a3b95e"), t.tone);
        C2.setColorAt(i, c);
      });
      C.instanceColor!.needsUpdate = true; C2.instanceColor!.needsUpdate = true;
      colored.current = true;
    }
    const p = clock.progress;
    if (p === last.current) return;
    last.current = p;
    trees.forEach((t, i) => {
      const k = t.appearAt < 0 ? 1 : smoothstep(t.appearAt, t.appearAt + 0.03, p);
      const s = t.s * Math.max(k, 0.0001);
      o.rotation.y = i;
      o.position.set(t.x, 0, t.z); o.scale.set(s, s, s); o.updateMatrix();
      T.setMatrixAt(i, o.matrix);
      o.position.set(t.x, 0.9 * s, t.z); o.scale.set(s * 1.5, s * 1.9, s * 1.5); o.updateMatrix();
      C.setMatrixAt(i, o.matrix);
      o.position.set(t.x, 1.9 * s, t.z); o.scale.set(s * 1.15, s * 1.5, s * 1.15); o.updateMatrix();
      C2.setMatrixAt(i, o.matrix);
    });
    T.instanceMatrix.needsUpdate = C.instanceMatrix.needsUpdate = C2.instanceMatrix.needsUpdate = true;
  });
  const n = trees.length;
  return (
    <group>
      <instancedMesh ref={trunks} args={[undefined, undefined, n]} castShadow frustumCulled={false}>
        <cylinderGeometry args={[0.12, 0.17, 1, 6]} /><meshStandardMaterial color="#6b5440" flatShading />
      </instancedMesh>
      <instancedMesh ref={crowns} args={[undefined, undefined, n]} castShadow receiveShadow frustumCulled={false}>
        <coneGeometry args={[0.7, 1.7, 7]} /><meshStandardMaterial flatShading roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={crowns2} args={[undefined, undefined, n]} castShadow frustumCulled={false}>
        <coneGeometry args={[0.55, 1.4, 7]} /><meshStandardMaterial flatShading roughness={0.9} />
      </instancedMesh>
    </group>
  );
}

/** Lampadaires le long de la rue : ils apparaissent avec la route et s'allument la nuit. */
export function Lamps() {
  const lamps = useMemo(() => makeLamps(), []);
  const poles = useRef<THREE.InstancedMesh>(null);
  const bulbs = useRef<THREE.InstancedMesh>(null);
  const glow = useRef<THREE.Points>(null);
  const bulbMat = useRef<THREE.MeshStandardMaterial>(null);
  const o = useMemo(() => new THREE.Object3D(), []);
  const sprite = useMemo(() => glowSprite(), []);
  const positions = useMemo(() => new Float32Array(lamps.length * 3), [lamps]);
  useFrame(() => {
    const P = poles.current, B = bulbs.current, G = glow.current;
    if (!P || !B || !G) return;
    const bx = streetBuiltX(clock.progress);
    lamps.forEach((l, i) => {
      const on = Math.abs(l.x - 2.9) < 0.01 ? clock.progress > 0.092 : l.x <= bx - 1 && clock.progress > 0.04;
      const s = on ? 1 : 0.0001;
      o.position.set(l.x, 0, l.z); o.scale.set(1, s, 1); o.updateMatrix(); P.setMatrixAt(i, o.matrix);
      o.position.set(l.x, 2.3 * s, l.z); o.scale.set(s, s, s); o.updateMatrix(); B.setMatrixAt(i, o.matrix);
      positions.set([l.x, on ? 2.3 : -50, l.z], i * 3);
    });
    P.instanceMatrix.needsUpdate = B.instanceMatrix.needsUpdate = true;
    (G.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (G.material as THREE.PointsMaterial).opacity = sky.night * 0.85;
    if (bulbMat.current) bulbMat.current.emissiveIntensity = 0.2 + sky.night * 3;
  });
  return (
    <group>
      <instancedMesh ref={poles} args={[undefined, undefined, lamps.length]} castShadow frustumCulled={false}>
        <cylinderGeometry args={[0.05, 0.07, 2.3, 6]} /><meshStandardMaterial color="#34373d" />
      </instancedMesh>
      <instancedMesh ref={bulbs} args={[undefined, undefined, lamps.length]} frustumCulled={false}>
        <sphereGeometry args={[0.16, 8, 6]} /><meshStandardMaterial ref={bulbMat} color="#fff2cc" emissive="#ffc878" emissiveIntensity={0.2} />
      </instancedMesh>
      <points ref={glow} frustumCulled={false}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
        <pointsMaterial map={sprite} color="#ffcf85" size={44} sizeAttenuation={false} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0} />
      </points>
    </group>
  );
}
