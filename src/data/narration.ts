import type { NarrationBeat } from "./types";

/** Fonction pure de `progress` : sous-titres parfaitement réversibles. */
export const narration: NarrationBeat[] = [
  { at: 0.0, until: 0.011, text: "Tout commence quelque part." },
  { at: 0.012, until: 0.034, text: "JC Leforest m'a donné la première fondation.", speak: true },
  { at: 0.036, until: 0.058, text: "Une route se construit. Puis une école apparaît.", speak: true },
  { at: 0.06, until: 0.078, text: "Le lycée m'a construit.", speak: true },
  { at: 0.082, until: 0.116, text: "Jusqu'ici, tout avait commencé dans le Nord. Puis il a fallu partir.", speak: true },
  { at: 0.118, until: 0.142, text: "Le design m'a appris à créer.", speak: true },
  { at: 0.146, until: 0.163, text: "Le CFA m'a rapproché du monde professionnel du sport. La Fédération m'a formé au métier de coach.", speak: true },
  { at: 0.164, until: 0.178, text: "La formation générale et la formation judo se rejoignent pour construire le coach.", speak: true },
  { at: 0.178, until: 0.188, text: "Et le dojo de Paris a marqué le passage vers une nouvelle vie.", speak: true },
  { at: 0.1885, until: 0.1925, text: "Les fondations étaient posées.", big: true, speak: true },
  { at: 0.1925, until: 0.1985, text: "Je ne savais pas encore quelle forme prendrait la suite. Mais les premières pierres étaient posées. Le judo m'avait appris à avancer. Le design m'avait appris à créer. Et la formation de coach allait m'apprendre à construire pour les autres.", big: true, speak: true },
];

export const introLines = {
  today: "Voici ma vie aujourd'hui.",
  notADay: "Mais une ville ne se construit pas en un jour.",
  rewind: "Remontons au début.",
  start: "COMMENCER",
  void1: "Avant les bâtiments, il n'y avait que le terrain.",
  void2: "Tout commence par une première fondation.",
};

export const chapterTwoTeaser = [
  "La ville va maintenant commencer à changer d'échelle.",
  "Le premier petit dojo va laisser place à une véritable activité de coach.",
  "La ville va commencer à devenir professionnelle.",
];
