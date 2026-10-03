# DUQUENNE CITY — *A life under construction*

Une ville 3D vivante qui raconte une vie. La caméra est **fixe** ; le scroll n'avance que le **temps** du monde.
Prototype vertical : **Chapitre I — Fondation** (JC Leforest → Lycée Gambetta → Gare → MJM/Webstart → CFA Omnisport → FFJudo → Dojo de Paris).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```
`?text=1` force la version texte (alternative sans 3D, aussi utilisée si WebGL est absent).

## Déroulé
1. **Intro** : la ville est complète (`progress = 1`) → « Voici ma vie aujourd'hui… » → **COMMENCER**
2. **Rewind** : `progress` 1 → 0 (GSAP). Bâtiments, routes, trace, arbres se défont ; vie ambiante ralentie ; le cycle solaire recule.
3. **Terrain vide** → texte → le scroll est débloqué.
4. **Scroll = temps** : `progress = scroll × PROTOTYPE_CAP` (lissé, réversible). Remonter défait la ville.
5. **Fin du chapitre** : nuit, lumières, trace reliant tous les lieux, train qui repart, teaser du Chapitre II.

## Architecture
```
app/                     Next.js (layout, page, CSS)
src/
  data/                  ← TOUT le contenu est ici, aucun bâtiment n'est codé à la main
    types.ts             BuildingDef, Chapter, RoadDef, TraceSegmentDef…
    buildings.ts         chapterOne[] (+ teasers du futur, visibles seulement intro/rewind)
    chapters.ts          6 chapitres (période, musique, ambiance) + PROTOTYPE_CAP
    infrastructure.ts    routes, trace violette, trains, marcheurs, voitures, arbres, monde
    narration.ts         sous-titres/voix = fonction pure de progress
  engine/
    timeline.ts          `clock` (haute fréquence, lu par la scène) + store UI (React)
    construction.ts      buildT(def, p) et stageT(stage, bt) : fondations → structure → murs → toit → fenêtres → enseigne → vie
    daynight.ts          progress → phase du jour → soleil/lune (direction, couleur, intensité), ciel, nuit
  scene/                 React Three Fiber
    CityCanvas.tsx       Canvas + CAMÉRA FIXE (cadrage recalculé au resize uniquement)
    Building.tsx         moteur de construction générique (parts + échafaudage instancié)
    archetypes/index.ts  dojo, school, station, design, cfa, federation, dojoParis, tower, block, house, site, landmark
    Roads / Trace / Life / World / Lighting
    textures.ts          textures canvas procédurales (brique, façade typographique, brise-soleil…) + enseignes
  audio/                 engine.ts (musique générative + sound design WebAudio), narrator.ts (voix off optionnelle)
  ui/                    Experience (boucle principale), Cards, Panel, TextStory
```

### Règles qui garantissent la réversibilité
- Tout l'état visuel est une **fonction pure** de `clock.progress` (bâtiments, routes, trace, trains, arbres, jour/nuit, cartes, sous-titres).
  Aucune animation d'apparition « événementielle » : seul le *temps ambiant* (piétons, voitures, particules) utilise l'horloge réelle.
- **Caméra** : position/cible constantes ; aucun contrôle, aucun lien avec souris/scroll.

### Ajouter un bâtiment
Ajouter une entrée dans `src/data/buildings.ts` (`archetype`, `position`, `buildStart/End`, `anchor`, `panel`…) et, si besoin,
un segment dans `traceSegments` / une route dans `roads`. Aucun code de scène à écrire.

### Pipeline Meshy → GLB
Le champ `model` de `BuildingDef` est prévu pour un GLB optimisé (draco/meshopt) à la place de l'archétype procédural.
Les archétypes servent de **blockout** lisible en attendant les assets (gare, lycée, école de design, FFJudo s'inspirent des références fournies).

## Prototype vs. à venir
Fait : caméra fixe, scroll = temps, construction par étapes, jour/nuit réels (ombres, fenêtres, lampadaires), trace violette,
cartes, panneau, audio synthétique + voix optionnelle (synthèse du navigateur), rewind, mobile simplifié, texte, `prefers-reduced-motion`.
À faire : chapitres II+, GLB réels, vraies voix/musiques (`public/audio/README.md`), LOD, transformations DUQQUE avant/après,
Global Dojo Network (lignes déjà en data), photos dans les panneaux (`panel.photos`).
