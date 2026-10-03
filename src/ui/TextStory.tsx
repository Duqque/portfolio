"use client";
import { chapterOne } from "@/data/buildings";
import { narration } from "@/data/narration";
import { setState } from "@/engine/timeline";

/** Alternative sans 3D (WebGL indisponible ou choix du visiteur) : le récit, dans l'ordre de la construction. */
export function TextStory() {
  return (
    <article className="textstory">
      <header>
        <h1>DUQUENNE CITY</h1>
        <p>A LIFE UNDER CONSTRUCTION</p>
        <button onClick={() => { location.search ? (location.href = location.pathname) : setState({ textMode: false }); }}>Retour à la ville 3D</button>
      </header>
      <h2>Chapitre I — Fondation</h2>
      <p className="lead">« Tout commence quelque part. »</p>
      {chapterOne.filter((b) => b.panel).map((b) => (
        <section key={b.id}>
          <small>{b.panel!.kicker} · {b.panel!.period} · {b.panel!.place}</small>
          <h3>{b.name}</h3>
          {b.panel!.narration.map((t) => <p key={t}>{t}</p>)}
          <p><strong>{b.panel!.gives}</strong></p>
        </section>
      ))}
      <section>
        <h3>Fin du chapitre</h3>
        <p>{narration[narration.length - 1].text}</p>
      </section>
    </article>
  );
}
