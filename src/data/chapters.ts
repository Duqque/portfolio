import type { Chapter } from "./types";

/** Le moteur est prêt pour les 6 chapitres ; seul « foundation » est jouable dans ce prototype. */
export const chapters: Chapter[] = [
  { id: "foundation", numeral: "I", title: "Fondation", quote: "Tout commence quelque part.", range: [0, 0.2], theme: "origins", ambience: "nord", palette: { accent: "#7747FF" } },
  { id: "formation", numeral: "II", title: "Formation", quote: "", range: [0.2, 0.34], theme: "build", ambience: "paris", palette: { accent: "#7747FF" } },
  { id: "construction", numeral: "III", title: "Construction", quote: "", range: [0.34, 0.55], theme: "competition", ambience: "ville", palette: { accent: "#7747FF" } },
  { id: "international", numeral: "IV", title: "International", quote: "", range: [0.55, 0.72], theme: "world", ambience: "monde", palette: { accent: "#7747FF" } },
  { id: "portugal", numeral: "V", title: "Portugal", quote: "", range: [0.72, 0.82], theme: "lisbon", ambience: "lisbonne", palette: { accent: "#7747FF" } },
  { id: "future", numeral: "VI", title: "Avenir", quote: "", range: [0.82, 1], theme: "future", ambience: "futur", palette: { accent: "#7747FF" } },
];

/** Dans ce prototype le scroll s'arrête à la fin du chapitre I. */
export const PROTOTYPE_CAP = chapters[0].range[1];

export function chapterAt(p: number) {
  return chapters.find((c) => p >= c.range[0] && p < c.range[1]) ?? chapters[chapters.length - 1];
}
