export type ChapterId = "foundation" | "formation" | "construction" | "international" | "portugal" | "future";
export type Category = "judo" | "etudes" | "transport" | "design" | "sport" | "federation" | "coach" | "business" | "innovation" | "infra";
export type Archetype =
  | "dojo" | "school" | "station" | "design" | "cfa" | "federation" | "dojoParis"
  | "square" | "stadium" | "arena" | "eiffel" | "arc" | "tower" | "block" | "house" | "site" | "landmark";

export interface PanelContent {
  kicker: string;          // « La première pierre »
  period: string;
  place: string;
  narration: string[];     // paragraphes courts, jamais une liste de CV
  gives: string;           // « La discipline. »
  tags: string[];
  /** Emplacements prévus pour les médias — à remplir avec de vrais contenus. */
  photos?: string[];
}

export interface BuildingDef {
  id: string;
  name: string;
  chapter: ChapterId;
  category: Category;
  archetype: Archetype;
  position: [number, number, number];
  rotationY?: number;
  /** largeur (x), profondeur (z), hauteur (y) */
  size: [number, number, number];
  /** GLB optionnel (pipeline Meshy). S'il est présent il remplace l'archétype procédural. */
  model?: string;
  buildStart: number;
  buildEnd: number;
  importance: number;
  country: string;
  audio?: string;
  description: string;
  connections: string[];
  /** point d'ancrage de la trace violette (x, z) */
  anchor: [number, number];
  sign?: string;
  tint?: string;
  status?: "complete" | "construction";
  card?: { tagline: string } | false;
  /** décalage vertical (px) de la carte pour éviter les chevauchements */
  cardLift?: number;
  cardDx?: number;
  panel?: PanelContent;
}

export interface Chapter {
  id: ChapterId;
  title: string;
  numeral: string;
  quote: string;
  range: [number, number];
  theme: "origins" | "build" | "competition" | "world" | "lisbon" | "future" | "final";
  ambience: string;
  palette: { accent: string };
}

export interface RoadDef {
  id: string;
  points: [number, number][];
  width: number;
  start: number;
  end: number;
}

export interface TraceSegmentDef {
  id: string;
  points: [number, number, number?][]; // x, z, y optionnel
  start: number;
  end: number;
  kind?: "trace" | "network";
}

export interface NarrationBeat {
  at: number;
  until: number;
  text: string;
  big?: boolean;
  speak?: boolean;
}

export interface TrainSchedule {
  arrive: [number, number];
  depart: [number, number];
}
