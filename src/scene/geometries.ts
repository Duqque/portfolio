import * as THREE from "three";
import type { Shape } from "./parts";

const g = new Map<Shape, THREE.BufferGeometry>();
function make(shape: Shape): THREE.BufferGeometry {
  switch (shape) {
    case "box": return new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
    case "cyl": return new THREE.CylinderGeometry(0.5, 0.5, 1, 12).translate(0, 0.5, 0);
    case "cone": return new THREE.ConeGeometry(0.5, 1, 8).translate(0, 0.5, 0);
    case "pyr": return new THREE.ConeGeometry(Math.SQRT1_2, 1, 4).rotateY(Math.PI / 4).translate(0, 0.5, 0);
    case "sphere": return new THREE.SphereGeometry(0.5, 10, 8).translate(0, 0.5, 0);
    case "dome": return new THREE.SphereGeometry(0.5, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 2, 1);
    case "prism": {
      // prisme triangulaire, long selon x, base sur y=0
      const s = new THREE.Shape();
      s.moveTo(-0.5, 0); s.lineTo(0.5, 0); s.lineTo(0, 1); s.closePath();
      const e = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false });
      e.translate(0, 0, -0.5);
      e.rotateY(Math.PI / 2);
      return e;
    }
  }
}
export function geometryFor(shape: Shape) {
  let x = g.get(shape);
  if (!x) { x = make(shape); g.set(shape, x); }
  return x;
}
