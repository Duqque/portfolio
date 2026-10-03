/* PROLOGUE — texte affiché en machine à écrire / karaoké, synchronisé sur public/audio/prologue.mp3.

   ⚠ TEXTE TEMPORAIRE : il reprend les phrases du brief en attendant la transcription exacte du mp3.
   Remplacez `PROLOGUE_TEXT` par le texte réellement prononcé (même ordre). Sans timings précis, chaque mot reçoit une
   durée proportionnelle à sa longueur sur la durée totale du fichier.
   Pour une synchro exacte, renseignez `PROLOGUE_TIMINGS` : [[mot, début_s, fin_s], …] (ex. export d'un outil de transcription). */
export const PROLOGUE_AUDIO = "/audio/prologue.mp3";
export const PROLOGUE_DURATION = 138; // secondes (durée du mp3 fourni)

export const PROLOGUE_TEXT = `Tout commence quelque part. Une ville ne se construit pas en un jour. Chaque expérience est une construction. Chaque rencontre crée une connexion. Chaque projet ajoute une nouvelle partie au monde. Et la construction continue. Voici ma vie. Pas un parcours à lire, mais une ville à regarder se construire. Remontons au début.`;

export const PROLOGUE_TIMINGS: [string, number, number][] | null = null;

export interface PWord { w: string; a: number; b: number }
export function prologueWords(): PWord[] {
  if (PROLOGUE_TIMINGS) return PROLOGUE_TIMINGS.map(([w, a, b]) => ({ w, a, b }));
  const words = PROLOGUE_TEXT.split(/\s+/).filter(Boolean);
  const lead = 1.5, tail = 3; // petit silence avant/après la voix
  const span = PROLOGUE_DURATION - lead - tail;
  const weights = words.map((w) => w.length + 2 + (/[.!?]$/.test(w) ? 5 : /[,;:]$/.test(w) ? 2 : 0));
  const total = weights.reduce((x, y) => x + y, 0);
  let t = lead;
  return words.map((w, i) => { const d = (weights[i] / total) * span; const o = { w, a: t, b: t + d }; t += d; return o; });
}
