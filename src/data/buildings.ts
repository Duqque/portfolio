import type { BuildingDef } from "./types";
import { rng } from "@/engine/math";

/* Repère monde : +x = vers « Paris » (bas-droite de l'écran), +z = vers la caméra (bas-gauche).
   Les façades regardent +z (rotationY = π : elles regardent -z). Rien ici ne représente une géographie réelle. */

export const chapterOne: BuildingDef[] = [
  {
    id: "jc-leforest", cardLift: 0, cardDx: -75, name: "JC Leforest", chapter: "foundation", category: "judo", archetype: "dojo",
    position: [-23, 0, 4.5], size: [6.6, 5, 3.4], buildStart: 0.008, buildEnd: 0.034, importance: 5, country: "france",
    description: "Le dojo du club formateur. La première pierre de la ville.", connections: ["lycee-gambetta"],
    anchor: [-23, 8.0], sign: "JC LEFOREST", card: { tagline: "Le commencement" },
    panel: {
      kicker: "La première pierre", period: "Les premières années", place: "Leforest · Hauts-de-France",
      narration: [
        "Un petit dojo de club formateur. Des tatamis, des enfants qui s'entraînent, des parents à l'entrée, des judokas qui arrivent avec leur sac.",
        "C'est ici que les premières habitudes de travail se sont installées : revenir, recommencer, durer.",
      ],
      gives: "La discipline.", tags: ["Judo", "Compétition", "Discipline", "Premières rencontres", "Premières ambitions"],
    },
  },
  {
    id: "lycee-gambetta", cardLift: 40, cardDx: 10, name: "Lycée Gambetta", chapter: "foundation", category: "etudes", archetype: "school",
    position: [-10, 0, 3.5], size: [11, 5.4, 5.4], buildStart: 0.05, buildEnd: 0.076, importance: 3, country: "france",
    description: "Le lycée de Tourcoing. Études, sport, adolescence.", connections: ["gare"],
    anchor: [-10, 7.6], sign: "LYCÉE GAMBETTA", card: { tagline: "Les bases" },
    panel: {
      kicker: "Construire les premières connaissances", period: "L'adolescence", place: "Tourcoing",
      narration: [
        "Une période de construction intellectuelle. Ici se croisent les études, le sport et l'adolescence.",
        "Pas une ligne de plus sur un parcours : une époque entière, avec sa cour, ses couloirs et son équilibre à tenir entre les cours et le tatami.",
      ],
      gives: "Les bases.", tags: ["Études", "Équilibre études / sport", "Adolescence"],
    },
  },
  {
    id: "gare", cardLift: 0, cardDx: 40, name: "La Gare", chapter: "foundation", category: "transport", archetype: "station",
    position: [1, 0, -9.5], size: [11, 4.6, 5.4], buildStart: 0.078, buildEnd: 0.1, importance: 5, country: "france",
    description: "Le premier grand départ. Nord → Paris.", connections: ["mjm-webstart"],
    anchor: [0, -13.4], sign: "GARE", card: { tagline: "Le départ" },
    panel: {
      kicker: "Le premier grand départ", period: "Le passage", place: "Nord → Paris",
      narration: [
        "Jusqu'ici, tout avait commencé dans le Nord. Puis il a fallu partir.",
        "Ce n'est pas seulement un déplacement géographique : c'est le passage vers une nouvelle étape de formation.",
      ],
      gives: "Le départ.", tags: ["Nord", "Paris", "Transition"],
    },
  },
  {
    id: "paris", name: "Paris", chapter: "foundation", category: "infra", archetype: "landmark",
    position: [17, 0, -8.5], size: [3, 3, 8], buildStart: 0.112, buildEnd: 0.13, importance: 2, country: "france",
    description: "Paris est symboliquement accessible.", connections: ["mjm-webstart"], anchor: [17, -10.6], card: false,
  },
  {
    id: "mjm-webstart", cardLift: 20, cardDx: -60, name: "MJM / Webstart", chapter: "foundation", category: "design", archetype: "design",
    position: [11, 0, 3.5], size: [8, 6.4, 5.6], buildStart: 0.12, buildEnd: 0.14, importance: 4, country: "france",
    description: "L'école de design de Lille. Sport + création.", connections: ["cfa-omnisport", "ffjudo"],
    anchor: [11, 7.6], sign: "MJM · WEBSTART", card: { tagline: "La créativité" },
    panel: {
      kicker: "Apprendre à créer", period: "La création", place: "Lille",
      narration: [
        "Le judo avait appris : discipline, effort, répétition, performance.",
        "Le design ajoute : créativité, image, communication, conception. Une deuxième dimension du profil — sport et création — que la ville va garder pour la suite.",
      ],
      gives: "La créativité.", tags: ["Design", "Communication", "Graphisme", "Numérique", "Conception"],
    },
  },
  {
    id: "cfa-omnisport", cardLift: 56, cardDx: 30, name: "CFA Omnisport", chapter: "foundation", category: "sport", archetype: "cfa",
    position: [22.5, 0, 4], size: [7, 5, 3.8], buildStart: 0.145, buildEnd: 0.16, importance: 3, country: "france",
    description: "Formation sportive dans l'environnement du Parc des Princes.", connections: ["dojo-paris"],
    anchor: [22.5, 7.2], sign: "CFA OMNISPORT", card: { tagline: "La professionnalisation sportive" },
    panel: {
      kicker: "Entrer dans le monde professionnel du sport", period: "La formation", place: "Paris · autour du Parc des Princes",
      narration: [
        "La découverte du fonctionnement d'une structure sportive : l'encadrement, la pédagogie, un environnement professionnel.",
        "Le stade reste au loin. Le sujet, ici, c'est la formation.",
      ],
      gives: "La professionnalisation.", tags: ["Encadrement", "Pédagogie", "Environnement sportif", "Professionnalisation"],
    },
  },
  {
    id: "ffjudo", cardLift: 0, cardDx: -50, name: "Fédération Française de Judo", chapter: "foundation", category: "federation", archetype: "federation",
    position: [22, 0, 17.5], rotationY: Math.PI, size: [11, 5.6, 4.4], buildStart: 0.148, buildEnd: 0.162, importance: 4, country: "france",
    description: "La formation spécifique au métier de coach de judo.", connections: ["dojo-paris"],
    anchor: [22, 13.7], sign: "FFJUDO", card: { tagline: "La méthode" },
    panel: {
      kicker: "Se former au métier de coach", period: "2020 – 2021", place: "Paris",
      narration: [
        "Un bâtiment institutionnel : une salle de formation, des tatamis, des documents, une méthode.",
        "Ici, le judo cesse d'être seulement une pratique. Il devient un métier qui s'apprend.",
      ],
      gives: "La méthode.", tags: ["Coach de judo", "Pédagogie", "Méthode", "Institution"],
    },
  },
  {
    id: "dojo-paris", cardLift: 16, cardDx: 50, name: "Dojo de Paris", chapter: "foundation", category: "coach", archetype: "dojoParis",
    position: [32, 0, 4.5], size: [8, 6, 4.8], buildStart: 0.166, buildEnd: 0.186, importance: 5, country: "france",
    description: "Judoka → coach. Le début de l'identité professionnelle.", connections: [],
    anchor: [32, 8.5], sign: "DOJO DE PARIS", card: { tagline: "Devenir coach" },
    panel: {
      kicker: "Judoka → coach", period: "2020 – 2021", place: "Paris",
      narration: [
        "JC Leforest, c'était le début du judo. Le dojo de Paris, c'est le début du métier de coach.",
        "Il rassemble la formation du CFA Omnisport et celle de la Fédération : le passage vers une nouvelle vie.",
      ],
      gives: "Le coach.", tags: ["Coach", "Identité professionnelle", "CFA Omnisport", "FFJudo"],
    },
  },
];


/* ───── Chapitre II — la ville change d'échelle. Seuls noms et rôles viennent du brief ;
   les textes des panneaux sont à renseigner. ───── */
const later = (kicker: string): NonNullable<BuildingDef["panel"]> => ({
  kicker, period: "À renseigner", place: "À renseigner",
  narration: ["Cette étape du parcours sera racontée ici."], gives: "", tags: [],
});
export const chapterTwo: BuildingDef[] = [
  {
    id: "judo-france-paris", name: "Judo France Paris", chapter: "formation", category: "coach", archetype: "dojoParis",
    position: [-6, 0, 17], rotationY: Math.PI, size: [8, 6, 4.8], buildStart: 0.205, buildEnd: 0.226, importance: 4, country: "france",
    description: "Une véritable activité de coach.", connections: ["puc"], anchor: [-6, 13.2], sign: "JUDO FRANCE PARIS",
    card: { tagline: "L'activité de coach" }, cardLift: 20, cardDx: -30, panel: later("Une véritable activité de coach"),
  },
  {
    id: "puc", name: "Paris Université Club", chapter: "formation", category: "sport", archetype: "cfa",
    position: [-21, 0, 18], rotationY: Math.PI, size: [7, 5, 3.8], buildStart: 0.232, buildEnd: 0.25, importance: 3, country: "france",
    description: "Un nouveau club.", connections: ["jccmm"], anchor: [-21, 14.2], sign: "PUC",
    card: { tagline: "Un nouveau club" }, cardLift: 14, cardDx: -60, panel: later("De nouveaux clubs"),
  },
  {
    id: "jccmm", name: "JCCMM", chapter: "formation", category: "judo", archetype: "dojo",
    position: [-35, 0, 4.5], size: [6.6, 5, 3.4], buildStart: 0.255, buildEnd: 0.274, importance: 3, country: "france", tint: "#e3b9a0",
    description: "Un club de plus dans la ville.", connections: ["grand-dome"], anchor: [-35, 8.0], sign: "JCCMM",
    card: { tagline: "Un club de plus" }, cardLift: 46, cardDx: -10, panel: later("De nouveaux clubs"),
  },
  {
    id: "grand-dome", name: "Grand Dôme de Villebon", chapter: "formation", category: "federation", archetype: "arena",
    position: [40, 0, 22], size: [13, 13, 4.2], buildStart: 0.284, buildEnd: 0.312, importance: 4, country: "france",
    description: "Un équipement à une autre échelle.", connections: [], anchor: [40, 14.2], sign: "GRAND DÔME",
    card: { tagline: "Une autre échelle" }, cardLift: 10, cardDx: 20, panel: later("Une autre échelle"),
  },
];

/* ───── Aperçu de la ville « aujourd'hui » — visible uniquement pendant l'intro / le rewind.
   Ce sont des placeholders de chapitres futurs, construits par le même moteur. ───── */
const T = (o: Partial<BuildingDef> & Pick<BuildingDef, "id" | "name" | "archetype" | "position" | "size" | "buildStart" | "buildEnd">): BuildingDef => ({
  chapter: "future", category: "business", importance: 3, country: "france", description: "", connections: [], anchor: [o.position[0], o.position[2] + o.size[1] / 2 + 1], card: false, ...o,
});

export const teasers: BuildingDef[] = [
  T({ id: "duqque-hq", name: "DUQQUE HQ", archetype: "tower", position: [44, 0, -4], size: [7, 7, 17], buildStart: 0.55, buildEnd: 0.96, sign: "DUQQUE", tint: "#7747FF" }),
  T({ id: "gdn-2", name: "Dojo — Lisbonne", archetype: "dojo", position: [-12, 0, -8], size: [6.6, 5, 3.4], buildStart: 0.72, buildEnd: 0.8, sign: "DOJO", tint: "#d9a066" }),
  T({ id: "gdn-3", name: "Dojo — Tokyo", archetype: "dojo", position: [5, 0, 25], size: [6.6, 5, 3.4], buildStart: 0.84, buildEnd: 0.9, sign: "DOJO", tint: "#c76f6f" }),
  T({ id: "gdn-4", name: "Dojo — Prague", archetype: "dojo", position: [28, 0, 28], size: [6.6, 5, 3.4], buildStart: 0.86, buildEnd: 0.92, sign: "DOJO", tint: "#7fa3c7" }),
  T({ id: "gdn-5", name: "Dojo — Almaty", archetype: "dojo", position: [-30, 0, 22], size: [6.6, 5, 3.4], buildStart: 0.88, buildEnd: 0.94, sign: "DOJO", tint: "#8fbf8a" }),
  T({ id: "rokudan", name: "Rokudan", archetype: "site", position: [-3, 0, 21], size: [7, 6, 6], buildStart: 0.62, buildEnd: 0.9, status: "construction" }),
  T({ id: "jenyz", name: "Jenyz France", archetype: "site", position: [-40, 0, 24], size: [6, 6, 6], buildStart: 0.7, buildEnd: 0.92, status: "construction" }),
  T({ id: "innovation-lab", name: "Sport Innovation Lab", archetype: "block", position: [12, 0, 23], size: [7, 6, 7], buildStart: 0.6, buildEnd: 0.78, tint: "#6aa4d8", sign: "LAB" }),
];

function scatterHouses(): BuildingDef[] {
  const r = rng(77);
  const spots: [number, number][] = [
    [-37, 6], [-36, -4], [-24, -23], [-20, -12], [-5, -22.5], [10, -22.5], [27, -22.5], [38, -14],
    [-38, 15], [-14, 28], [-30, 27], [10, 28], [46, 28], [47, 12], [-34, 28], [20, 28],
  ];
  return spots.map(([x, z], i) => {
    const w = 3.4 + r() * 2.2, d = 3 + r() * 1.8, h = 2.4 + r() * 3.2;
    const start = 0.22 + r() * 0.6;
    return T({
      id: `house-${i}`, name: "Maison", archetype: i % 3 === 0 ? "block" : "house", position: [x, 0, z], size: [w, d, h],
      buildStart: start, buildEnd: start + 0.05, tint: ["#e3c9a8", "#d9b9a6", "#c9d3d9", "#e8dcc2", "#cdbba9"][i % 5],
    });
  });
}

export const story: BuildingDef[] = [...chapterOne, ...chapterTwo];
export const buildings: BuildingDef[] = [...story, ...teasers, ...scatterHouses()];
export const buildingById = Object.fromEntries(buildings.map((b) => [b.id, b])) as Record<string, BuildingDef>;
