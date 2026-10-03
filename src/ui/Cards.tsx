"use client";
import { useEffect, useRef } from "react";
import { buildings, buildingById } from "@/data/buildings";
import { setState, useUI } from "@/engine/timeline";
import { speak } from "@/audio/narrator";

const withCard = buildings.filter((b) => b.card);
const ICON: Record<string, string> = { judo: "柔", etudes: "▤", transport: "⇄", design: "✦", sport: "◎", federation: "⚑", coach: "★", business: "▣", innovation: "✧", infra: "◆" };

/** Petites cartes HTML, ancrées au bâtiment, qui apparaissent à 100 % de construction — jamais ouvertes automatiquement. */
export function Cards() {
  const completed = useUI((s) => s.completed);
  const phase = useUI((s) => s.phase);
  const openId = useUI((s) => s.openId);
  return (
    <div className="cards">
      {withCard.map((b) => {
        const show = phase === "scroll" && !openId && completed.includes(b.id);
        return (
          <div key={b.id} id={`card-${b.id}`} className="card-anchor">
            <button
              className={`card ${show ? "on" : ""}`}
              tabIndex={show ? 0 : -1}
              aria-hidden={!show}
              onClick={() => setState({ openId: b.id })}
              aria-label={`${b.name} — ${b.card && b.card.tagline}. Découvrir`}
            >
              <i aria-hidden>{ICON[b.category] ?? "◆"}</i>
              <b>{b.name.toUpperCase()}</b>
              <em>{b.card && b.card.tagline} →</em>
            </button>
          </div>
        );
      })}
    </div>
  );
}

/** Panneau d'expérience : élégant, minimal, la ville reste visible derrière. */
export function Panel() {
  const openId = useUI((s) => s.openId);
  const closeRef = useRef<HTMLButtonElement>(null);
  const def = openId ? buildingById[openId] : null;
  useEffect(() => { if (openId) closeRef.current?.focus(); }, [openId]);
  const c = def?.panel;
  return (
    <aside className={`panel ${def ? "on" : ""}`} role="dialog" aria-modal="false" aria-label={def?.name} aria-hidden={!def}>
      {def && c && (
        <div className="inner" key={def.id}>
          <button ref={closeRef} className="close" onClick={() => setState({ openId: null })} aria-label="Fermer">✕</button>
          <small>{c.kicker}</small>
          <h2>{def.name}</h2>
          <dl>
            <div><dt>Période</dt><dd>{c.period}</dd></div>
            <div><dt>Lieu</dt><dd>{c.place}</dd></div>
            <div><dt>Univers</dt><dd>{def.category}</dd></div>
          </dl>
          {c.narration.map((t) => <p key={t}>{t}</p>)}
          {c.gives && <p className="gives">{c.gives}</p>}
          <ul>{c.tags.map((t) => <li key={t}>{t}</li>)}</ul>
          {c.photos?.map((src) => <img key={src} src={src} alt="" />)}
          <button className="listen" onClick={() => speak(c.narration.join(" "), def.audio)}>▶ ÉCOUTER</button>
        </div>
      )}
    </aside>
  );
}
