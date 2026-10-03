"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { setState, useUI } from "@/engine/timeline";
import { PROLOGUE_AUDIO, PROLOGUE_DURATION, prologueWords } from "@/data/prologue";

/** Avant la carte : écran noir, texte en machine à écrire / karaoké piloté par le mp3 ET par le scroll. */
export function Prologue() {
  const phase = useUI((s) => s.phase);
  const sound = useUI((s) => s.sound);
  const words = useMemo(prologueWords, []);
  const [t, setT] = useState(0);
  const [started, setStarted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const prog = useRef({ lastSet: 0, userAt: 0 });

  const finish = useCallback(() => {
    audio.current?.pause();
    setLeaving(true);
    window.scrollTo(0, 0);
    setTimeout(() => setState({ phase: "intro" }), 900);
  }, []);

  const start = useCallback(() => {
    const a = new Audio(PROLOGUE_AUDIO);
    a.muted = !sound;
    audio.current = a;
    a.play().catch(() => {});
    setStarted(true);
  }, [sound]);

  useEffect(() => { if (audio.current) audio.current.muted = !sound; }, [sound]);

  useEffect(() => {
    if (phase !== "prologue" || !started) return;
    const onScroll = () => {
      if (Math.abs(window.scrollY - prog.current.lastSet) > 4) prog.current.userAt = performance.now();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    let raf = 0;
    const loop = () => {
      const a = audio.current;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      let time: number;
      if (performance.now() - prog.current.userAt < 700) {
        // le visiteur fait défiler : le scroll pilote le temps (et le son suit)
        time = (window.scrollY / max) * PROLOGUE_DURATION;
        if (a) a.currentTime = Math.min(time, (a.duration || PROLOGUE_DURATION) - 0.05);
      } else {
        time = a?.currentTime ?? 0;
        prog.current.lastSet = (time / PROLOGUE_DURATION) * max;
        window.scrollTo(0, prog.current.lastSet);
        if (a && a.paused && time > 0 && !a.ended && window.scrollY < max - 5) a.play().catch(() => {});
      }
      setT(time);
      if (time >= PROLOGUE_DURATION - 0.3 || a?.ended) { finish(); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); };
  }, [phase, started, finish]);

  if (phase !== "prologue") return null;
  return (
    <section className={`prologue ${leaving ? "leaving" : ""}`} aria-label="Prologue">
      {!started ? (
        <div className="p-gate">
          <p>DUQUENNE CITY</p>
          <small>A LIFE UNDER CONSTRUCTION</small>
          <button className="cta on" onClick={start}>ÉCOUTER LE PROLOGUE</button>
          <button className="skip static" onClick={finish}>PASSER →</button>
        </div>
      ) : (
        <>
          <button className="skip" onClick={finish}>PASSER LE PROLOGUE →</button>
          <p className="karaoke">
            {words.map((w, i) => {
              if (t < w.a) return <span key={i} className="w future">{w.w} </span>;
              if (t >= w.b) return <span key={i} className="w done">{w.w} </span>;
              const n = Math.max(1, Math.ceil(((t - w.a) / (w.b - w.a)) * w.w.length));
              return (
                <span key={i} className="w cur">
                  {w.w.slice(0, n)}<span className="caret" />
                  <span className="rest">{w.w.slice(n)}</span>{" "}
                </span>
              );
            })}
          </p>
          <div className="p-bar" aria-hidden><i style={{ width: `${(t / PROLOGUE_DURATION) * 100}%` }} /></div>
        </>
      )}
    </section>
  );
}
