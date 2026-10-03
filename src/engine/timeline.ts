import { useSyncExternalStore } from "react";

export type Phase = "intro" | "rewind" | "void" | "scroll";

/** État haute fréquence, lu par la scène à chaque frame (jamais via React). */
export const clock = {
  /** progress global affiché 0 → 1 (déjà lissé) */
  progress: 1,
  /** progress visé (scroll) */
  target: 0,
  /** vitesse absolue de variation de progress (par seconde) — alimente l'audio */
  speed: 0,
  /** temps réel en secondes (animations ambiantes seulement) */
  time: 0,
  /** 0..1 : ralentissement/accélération de la vie ambiante */
  life: 1,
};

export interface UIState {
  phase: Phase;
  openId: string | null;
  voice: boolean;
  sound: boolean;
  subtitles: boolean;
  textMode: boolean;
  reduced: boolean;
  low: boolean;
  completed: string[];
  started: boolean;
  beat: number;
  ended: boolean;
}

let state: UIState = {
  phase: "intro", openId: null, voice: false, sound: true, subtitles: true, textMode: false,
  reduced: false, low: false, completed: [], started: false, beat: -1, ended: false,
};
const listeners = new Set<() => void>();

export const getState = () => state;
export function setState(patch: Partial<UIState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}
export function useUI<T>(selector: (s: UIState) => T): T {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => selector(state),
    () => selector(state),
  );
}
