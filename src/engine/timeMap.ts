import { story } from "@/data/buildings";
import { PROTOTYPE_CAP } from "@/data/chapters";

/* Dilatation du temps : le scroll est plus « long » pendant qu'un bâtiment se construit.
   Fonction monotone → toujours réversible. */
const N = 4000;
const cum = new Float32Array(N + 1);
const BOOST = 3.2;
(function build() {
  let acc = 0;
  for (let i = 0; i <= N; i++) {
    const p = (i / N) * PROTOTYPE_CAP;
    let d = 1;
    for (const b of story) if (p >= b.buildStart - 0.003 && p <= b.buildEnd + 0.003) { d = 1 + BOOST; break; }
    acc += d;
    cum[i] = acc;
  }
  for (let i = 0; i <= N; i++) cum[i] /= acc;
})();

/** position de scroll normalisée (0..1) → progress global */
export function scrollToProgress(s: number): number {
  const t = Math.min(1, Math.max(0, s));
  let lo = 0, hi = N;
  while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] < t) lo = m + 1; else hi = m; }
  const a = cum[Math.max(0, lo - 1)], b = cum[lo];
  const f = b > a ? (t - a) / (b - a) : 0;
  return ((Math.max(0, lo - 1) + f) / N) * PROTOTYPE_CAP;
}
/** progress global → position de scroll normalisée */
export function progressToScroll(p: number): number {
  const x = (Math.min(PROTOTYPE_CAP, Math.max(0, p)) / PROTOTYPE_CAP) * N;
  const i = Math.floor(x);
  return cum[i] + (cum[Math.min(N, i + 1)] - cum[i]) * (x - i);
}
