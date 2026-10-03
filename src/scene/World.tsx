"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { POND, WORLD, RAIL_Z, makeLamps, streetBuiltX, makeTrees } from "@/data/infrastructure";
import { clock, getState } from "@/engine/timeline";
import { sky } from "@/engine/daynight";
import { rng, smoothstep, fbm } from "@/engine/math";
import { glowSprite } from "./textures";
import { buildings } from "@/data/buildings";
import { buildT } from "@/engine/construction";

const W = WORLD.maxX - WORLD.minX, D = WORLD.maxZ - WORLD.minZ;
const CX = (WORLD.maxX + WORLD.minX) / 2, CZ = (WORLD.maxZ + WORLD.minZ) / 2;

/* ───── L'île : relief procédural, montagnes à l'ouest, plateau urbain au centre-est, plages, océan profond ───── */
export const ISLAND = { cx: -8, cz: 0, rx: 98, rz: 62 };
const smooth = (a: number, b: number, x: number) => smoothstep(a, b, x);
export function heightAt(x: number, z: number): number {
  const dx = (x - ISLAND.cx) / ISLAND.rx, dz = (z - ISLAND.cz) / ISLAND.rz;
  const ang = Math.atan2(dz, dx);
  const wob = 1 + 0.12 * Math.sin(ang * 3 + 1.3) + 0.07 * Math.sin(ang * 7 + 0.4) + (fbm(x * 0.05, z * 0.05, 3) - 0.5) * 0.2;
  const d = Math.hypot(dx, dz) / wob;
  const land = 1 - smooth(0.74, 1.0, d);
  const mount = smooth(-44, -88, x) + smooth(-30, -58, z) * 0.55 + smooth(60, 95, z) * 0.15;
  let h = (fbm(x * 0.045, z * 0.045) - 0.38) * 17 * (0.35 + mount * 3.1);
  h = Math.max(h, 0.15) * land - smooth(0.86, 1.04, d) * 7;
  // plateau urbain parfaitement plat (la ville repose sur y = 0)
  const out = Math.max(Math.abs(x - 4) - 52, Math.abs(z - 2.5) - 31, 0);
  return THREE.MathUtils.lerp(h, 0, 1 - smooth(0, 16, out));
}

export function Terrain() {
  const low = getState().low;
  const geo = useMemo(() => {
    const W = 262, D = 172, sx = low ? 130 : 262, sz = low ? 86 : 172;
    const g = new THREE.PlaneGeometry(W, D, sx, sz);
    g.rotateX(-Math.PI / 2);
    g.translate(ISLAND.cx, 0, ISLAND.cz);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, heightAt(pos.getX(i), pos.getZ(i)));
    g.computeVertexNormals();
    const nor = g.attributes.normal;
    const col = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    const sand = new THREE.Color("#a29468"), grass = new THREE.Color("#3b4c2e"), grass2 = new THREE.Color("#52633a"), rock = new THREE.Color("#5c5446"), high = new THREE.Color("#7b766b"), shallow = new THREE.Color("#4a8a9c"), deep = new THREE.Color("#0b3a74");
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), ny = nor.getY(i);
      const n = fbm(x * 0.2, z * 0.2, 3), n2 = fbm(x * 0.9, z * 0.9, 2);
      const dd = Math.hypot((x - ISLAND.cx) / ISLAND.rx, (z - ISLAND.cz) / ISLAND.rz);
      c.copy(grass).lerp(grass2, n);
      c.lerp(rock, smooth(0.9, 0.7, ny) + smooth(5, 14, y) * 0.5);
      c.lerp(high, smooth(16, 30, y));
      c.multiplyScalar(0.8 + n2 * 0.4);
      c.lerp(sand, smooth(1.1, 0.2, y) * smooth(0.6, 0.74, dd) * (0.85 + n2 * 0.3));
      c.lerp(shallow, smooth(0.0, -0.9, y));
      c.lerp(deep, smooth(-1.0, -5, y));
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, [low]);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} />
    </mesh>
  );
}

/** Océan bleu profond, texturé, légèrement translucide (les hauts-fonds transparaissent). */
export function Ocean() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#1457a6"; g.fillRect(0, 0, 256, 256);
    const r = rng(5);
    for (let i = 0; i < 1800; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "120,190,255" : "5,30,80"},${0.04 + r() * 0.1})`; g.fillRect(r() * 256, r() * 256, 2 + r() * 14, 1 + r() * 2); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(70, 56); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    return t;
  }, []);
  useFrame(() => { tex.offset.set(clock.time * 0.0012, clock.time * 0.0007); });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ISLAND.cx, -0.6, ISLAND.cz]} renderOrder={1}>
      <planeGeometry args={[2400, 1800]} />
      <meshStandardMaterial map={tex} color="#9db8d8" transparent opacity={0.9} roughness={0.35} metalness={0.15} depthWrite={false} />
    </mesh>
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

/** Pastilles bleues pulsantes au pied de chaque lieu terminé (repère interactif, façon carte tactique). */
export function Beacons() {
  const list = useMemo(() => buildings.filter((b) => b.card), []);
  const groups = useRef<(THREE.Group | null)[]>([]);
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(() => {
    list.forEach((b, i) => {
      const g = groups.current[i], r = rings.current[i];
      if (!g || !r) return;
      const k = smoothstep(0.92, 1, buildT(b, clock.progress));
      g.visible = k > 0.01;
      g.scale.setScalar(k);
      const t = (clock.time * 0.5 + i * 0.37) % 1;
      r.scale.setScalar(1 + t * 0.7);
      (r.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.55;
    });
  });
  return (
    <group>
      {list.map((b, i) => {
        const rad = Math.max(b.size[0], b.size[1]) / 2 + 1.4;
        return (
          <group key={b.id} ref={(el) => { groups.current[i] = el; }} position={[b.position[0], 0.3, b.position[2]]} visible={false}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
              <circleGeometry args={[rad, 36]} /><meshBasicMaterial color="#3aa0e8" transparent opacity={0.22} depthWrite={false} toneMapped={false} />
            </mesh>
            <mesh ref={(el) => { rings.current[i] = el; }} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
              <ringGeometry args={[rad - 0.18, rad, 48]} /><meshBasicMaterial color="#6cc0ff" transparent opacity={0.5} depthWrite={false} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
