/* Voix off : optionnelle (VOIX ON/OFF). Utilise un fichier audio si `audio` est fourni sur le bâtiment,
   sinon la synthèse vocale du navigateur (placeholder) — voix française, grave, posée. */
let current: HTMLAudioElement | null = null;

function pickVoice(): SpeechSynthesisVoice | undefined {
  const vs = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("fr"));
  return vs.find((v) => /thomas|henri|male|paul|antoine|google fran/i.test(v.name)) ?? vs[0];
}
export function speak(text: string, file?: string) {
  stop();
  if (typeof window === "undefined") return;
  if (file) { current = new Audio(file); current.play().catch(() => {}); return; }
  if (!("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "fr-FR"; u.rate = 0.9; u.pitch = 0.75; u.volume = 0.95;
  const v = pickVoice(); if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}
export function stop() {
  if (typeof window === "undefined") return;
  current?.pause(); current = null;
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
