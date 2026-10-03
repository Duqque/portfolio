"use client";
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { clock, getState } from "@/engine/timeline";
import { sky, updateSky } from "@/engine/daynight";
import { updateGlow } from "./materials";

const TARGET = new THREE.Vector3(2, 0, 0);

/** Vraie variation de lumière : direction, intensité, couleur du soleil/lune, ciel, ombres, fenêtres, lampadaires. */
export function Lighting() {
  const sun = useRef<THREE.DirectionalLight>(null);
  const moon = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const { scene, gl } = useThree();
  const skyEl = useRef<HTMLElement | null>(null);
  const starEl = useRef<HTMLElement | null>(null);
  const low = getState().low;

  useFrame(() => {
    updateSky(clock.progress);
    const s = sun.current, m = moon.current, h = hemi.current;
    if (s) { s.position.copy(sky.sunDir).add(TARGET); s.color.copy(sky.sunColor); s.intensity = sky.sunInt; }
    if (m) { m.position.copy(sky.moonDir).add(TARGET); m.intensity = sky.moonInt; }
    if (h) { h.color.copy(sky.hemiSky); h.groundColor.copy(sky.hemiGround); h.intensity = sky.hemiInt; }
    updateGlow(sky.night);
    gl.toneMappingExposure = 1.05 + sky.night * 0.55;
    (scene.fog as THREE.Fog | null)?.color.copy(sky.bottom);
    if (!skyEl.current) skyEl.current = document.getElementById("sky");
    if (!starEl.current) starEl.current = document.getElementById("stars");
    if (skyEl.current) skyEl.current.style.background = `linear-gradient(180deg, #${sky.top.getHexString()} 0%, #${sky.bottom.getHexString()} 100%)`;
    if (starEl.current) starEl.current.style.opacity = String(Math.max(0, (sky.night - 0.4) / 0.6));
  });

  const shadow = low ? 1024 : 2048;
  return (
    <>
      <hemisphereLight ref={hemi} />
      <directionalLight ref={sun} castShadow shadow-mapSize={[shadow, shadow]} shadow-bias={-0.0004} shadow-normalBias={0.05}
        shadow-camera-left={-62} shadow-camera-right={62} shadow-camera-top={52} shadow-camera-bottom={-52} shadow-camera-near={1} shadow-camera-far={220}
        target-position={[2, 0, 0]} />
      <directionalLight ref={moon} color="#a9bcff" castShadow={!low} shadow-mapSize={[1024, 1024]} shadow-bias={-0.0006} shadow-normalBias={0.05}
        shadow-camera-left={-62} shadow-camera-right={62} shadow-camera-top={52} shadow-camera-bottom={-52} shadow-camera-near={1} shadow-camera-far={220}
        target-position={[2, 0, 0]} />
    </>
  );
}
