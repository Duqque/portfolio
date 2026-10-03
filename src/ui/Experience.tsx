"use client";
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { clock, getState, setState, useUI } from "@/engine/timeline";
import { PROTOTYPE_CAP, chapterAt } from "@/data/chapters";
import { narration, introLines, nextTeaser } from "@/data/narration";
import { buildings, story } from "@/data/buildings";
import { buildT } from "@/engine/construction";
import { trainSpeed } from "@/data/infrastructure";
import { sky } from "@/engine/daynight";
import { clamp } from "@/engine/math";
import { scrollToProgress, progressToScroll } from "@/engine/timeMap";
import { cityAudio } from "@/audio/engine";
import { cameraApi } from "@/engine/cameraApi";
import { speak, stop as stopSpeech } from "@/audio/narrator";
import { Cards, Panel } from "./Cards";
import { TextStory } from "./TextStory";
import { Prologue } from "./Prologue";

const CityCanvas = lazy(() => import("@/scene/CityCanvas"));

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch { return false; }
}

export default function Experience() {
  const phase = useUI((s) => s.phase);
  const openId = useUI((s) => s.openId);
  const textMode = useUI((s) => s.textMode);
  const ready = useRef(false);
  const [mounted, setMounted] = useState(false);

  /* ── préférences & capacités ── */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const low = window.matchMedia("(max-width: 820px)").matches || window.matchMedia("(pointer: coarse)").matches;
    const gl = hasWebGL() && !new URLSearchParams(location.search).has("text");
    setState({ reduced, low, textMode: !gl });
    clock.progress = 1; clock.life = 1;
    ready.current = true;
    setMounted(true);
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  /* ── verrouillage du scroll tant que le temps ne doit pas avancer ── */
  useEffect(() => {
    const free = (phase === "scroll" || phase === "prologue") && !openId && !textMode;
    document.documentElement.style.overflow = free ? "" : "hidden";
    return () => { document.documentElement.style.overflow = ""; };
  }, [phase, openId, textMode]);

  /* ── boucle principale : le scroll EST le temps ── */
  useEffect(() => {
    let raf = 0, last = performance.now(), lastP = clock.progress, lastBeat = -1;
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      clock.time += dt;
      const st = getState();
      if (st.phase === "scroll" && !st.textMode) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const s = max > 0 ? clamp(window.scrollY / max) : 0;
        clock.target = scrollToProgress(s);
        const diff = clock.target - clock.progress;
        clock.progress = st.reduced || Math.abs(diff) < 1e-5 ? clock.target : clock.progress + diff * (1 - Math.exp(-dt * 3));
        if (st.ended !== s > 0.985) setState({ ended: s > 0.985 });
      }
      clock.speed = dt > 0 ? Math.abs(clock.progress - lastP) / dt : 0;
      lastP = clock.progress;

      // sous-titres / voix : fonction pure de progress
      let b = -1;
      if (st.phase === "scroll") b = narration.findIndex((n) => clock.progress >= n.at && clock.progress < n.until);
      if (b !== st.beat) setState({ beat: b });
      if (b !== lastBeat) {
        if (st.voice && st.phase === "scroll" && b >= 0 && narration[b].speak && clock.speed > 0) speak(narration[b].text);
        if (b < 0 && st.voice) stopSpeech();
        lastBeat = b;
      }

      if (cityAudio.running) {
        let building = 0;
        for (const x of buildings) { const t = buildT(x, clock.progress); if (t > 0 && t < 1) building++; }
        const moving = Math.min(1, clock.speed * 60);
        cityAudio.inputs = { p: clock.progress, night: sky.night, speed: clock.speed, life: clock.life, train: trainSpeed(clock.progress) * Math.max(moving, st.phase === "rewind" ? 0.6 : 0), building, phase: st.phase };
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ── touche Échap : fermer le panneau ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && getState().openId) setState({ openId: null }); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const begin = useCallback(() => {
    cityAudio.start();
    const st = getState();
    setState({ phase: "rewind", started: true });
    gsap.to(clock, { progress: 0, life: 0.12, duration: st.reduced ? 1.4 : 9.5, ease: "power2.inOut", onComplete: () => setState({ phase: "void" }) });
  }, []);

  const toScroll = useCallback(() => {
    gsap.killTweensOf(clock);
    clock.progress = 0; clock.target = 0;
    gsap.to(clock, { life: 1, duration: 1.5 });
    window.scrollTo(0, 0);
    setState({ phase: "scroll", openId: null });
  }, []);

  const stars = useMemo(() => {
    if (typeof window === "undefined") return "";
    const s: string[] = [];
    let a = 7;
    const r = () => { a = (a * 16807) % 2147483647; return a / 2147483647; };
    for (let i = 0; i < 110; i++) s.push(`${(r() * 100).toFixed(1)}vw ${(r() * 70).toFixed(1)}vh 0 ${r() > 0.85 ? 1 : 0}px rgba(255,255,255,${(0.4 + r() * 0.6).toFixed(2)})`);
    return s.join(",");
  }, [mounted]);

  return (
    <main className="stage">
      <div id="sky" aria-hidden />
      <div id="stars" aria-hidden><i style={{ boxShadow: stars }} /></div>
      {mounted && !textMode && (
        <Suspense fallback={null}><CityCanvas /></Suspense>
      )}
      <div className="vignette" aria-hidden />
      {mounted && textMode && <TextStory />}
      {mounted && !textMode && <>
        <Hud />
        <IntroOverlay begin={begin} done={toScroll} />
        <Prologue />
        <Cards />
        <Panel />
        <Subtitles />
        <EndOverlay />
        <ProgressRail />
      </>}
      {(phase === "scroll" || phase === "prologue") && !textMode && <div className={phase === "prologue" ? "spacer prologue-spacer" : "spacer"} aria-hidden />}
    </main>
  );
}

/* ───────────────────────── HUD ───────────────────────── */
function Hud() {
  const phase = useUI((s) => s.phase);
  const voice = useUI((s) => s.voice);
  const sound = useUI((s) => s.sound);
  const subtitles = useUI((s) => s.subtitles);
  const textMode = useUI((s) => s.textMode);
  const p = useChapterLabel();
  return (
    <header className="hud">
      <div className="brand">
        <strong>DUQUENNE CITY</strong>
        <span>A LIFE UNDER CONSTRUCTION</span>
        {phase === "scroll" && p && <em>{p}</em>}
      </div>
      <nav className="toggles" aria-label="Réglages">
        <button aria-pressed={voice} onClick={() => { setState({ voice: !voice }); if (voice) stopSpeech(); else cityAudio.start(); }}>VOIX {voice ? "ON" : "OFF"}</button>
        <button aria-pressed={sound} onClick={() => { cityAudio.start(); cityAudio.setEnabled(!sound); setState({ sound: !sound }); }}>SON {sound ? "ON" : "OFF"}</button>
        <button aria-pressed={subtitles} onClick={() => setState({ subtitles: !subtitles })}>SOUS-TITRES</button>
        <button aria-pressed={textMode} onClick={() => setState({ textMode: true })}>TEXTE</button>
      </nav>
      <nav className="camera" aria-label="Caméra">
        <button onClick={() => cameraApi.zoom(0.8)} aria-label="Zoom avant">+</button>
        <button onClick={() => cameraApi.zoom(1.25)} aria-label="Zoom arrière">−</button>
        <button onClick={() => cameraApi.recenter()} aria-label="Recentrer la vue">⌖</button>
      </nav>
    </header>
  );
}
function useChapterLabel() {
  const get = () => {
    const c = chapterAt(clock.progress);
    return `CHAPITRE ${c.numeral} — ${c.title.toUpperCase()}`;
  };
  return useSyncExternalStore((cb) => { const i = setInterval(cb, 400); return () => clearInterval(i); }, get, () => "");
}

/* ───────────────────────── Intro / rewind / terrain vide ───────────────────────── */
function IntroOverlay({ begin, done }: { begin: () => void; done: () => void }) {
  const phase = useUI((s) => s.phase);
  const [step, setStep] = useState(0);
  useEffect(() => {
    setStep(0);
    const T: number[] = [];
    const at = (ms: number, n: number) => T.push(window.setTimeout(() => setStep(n), ms));
    if (phase === "intro") { at(1200, 1); at(4600, 2); at(7600, 3); }
    if (phase === "void") { at(300, 1); at(2600, 2); at(6200, 3); T.push(window.setTimeout(done, 9000)); }
    return () => T.forEach(clearTimeout);
  }, [phase, done]);

  if (phase === "prologue") return null;
  if (phase === "scroll") return <ScrollHint />;
  const skip = phase !== "intro" && (
    <button className="skip" onClick={done}>PASSER L'INTRO →</button>
  );
  return (
    <section className={`intro intro-${phase}`} aria-live="polite">
      {skip}
      {phase === "intro" && (
        <div className="lines">
          <p className={step >= 1 ? "on" : ""}>{introLines.today}</p>
          <p className={step >= 2 ? "on" : ""}>{introLines.notADay}</p>
          <p className={`strong ${step >= 3 ? "on" : ""}`}>{introLines.rewind}</p>
          <button className={`cta ${step >= 3 ? "on" : ""}`} onClick={begin} disabled={step < 3} tabIndex={step < 3 ? -1 : 0}>{introLines.start}</button>
        </div>
      )}
      {phase === "rewind" && <div className="rewind"><span>◀◀</span> REWIND</div>}
      {phase === "void" && (
        <div className="lines center">
          <p className={`chapter ${step >= 1 ? "on" : ""}`}>CHAPITRE I — FONDATION<br /><span>« Tout commence quelque part. »</span></p>
          <p className={step >= 2 ? "on" : ""}>{introLines.void1}</p>
          <p className={`strong ${step >= 3 ? "on" : ""}`}>{introLines.void2}</p>
        </div>
      )}
    </section>
  );
}
function ScrollHint() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const f = () => { if (window.scrollY > 40) setShow(false); };
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return <div className={`hint ${show ? "on" : ""}`} aria-hidden={!show}>Faites défiler pour avancer le temps <b>↓</b></div>;
}

/* ───────────────────────── Sous-titres ───────────────────────── */
function Subtitles() {
  const beat = useUI((s) => s.beat);
  const subtitles = useUI((s) => s.subtitles);
  const n = beat >= 0 ? narration[beat] : null;
  return (
    <div className={`subs ${n && subtitles ? "on" : ""} ${n?.big ? "big" : ""}`} role="status" aria-live="polite">
      {n && <p key={beat}>{n.text}</p>}
    </div>
  );
}

/* ───────────────────────── Fin du chapitre ───────────────────────── */
function EndOverlay() {
  const ended = useUI((s) => s.ended);
  const open = useUI((s) => s.openId);
  return (
    <aside className={`end ${ended && !open ? "on" : ""}`} aria-hidden={!ended}>
      <h2>CHAPITRE III</h2>
      {nextTeaser.map((t) => <p key={t}>{t}</p>)}
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} tabIndex={ended ? 0 : -1}>↑ REMONTER LE TEMPS</button>
    </aside>
  );
}

/* ───────────────────────── Rail de progression ───────────────────────── */
function ProgressRail() {
  const phase = useUI((s) => s.phase);
  const fill = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const f = () => { if (fill.current) fill.current.style.height = `${progressToScroll(clock.progress) * 100}%`; raf = requestAnimationFrame(f); };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className={`rail ${phase === "scroll" ? "on" : ""}`} aria-hidden>
      <div className="track"><div ref={fill} className="fill" /></div>
      {story.filter((b) => b.card).map((b) => (
        <i key={b.id} style={{ top: `${progressToScroll(b.buildEnd) * 100}%` }} title={b.name} />
      ))}
    </div>
  );
}
