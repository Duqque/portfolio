/** Pont entre l'UI (boutons +/−/recentrer) et la caméra de la scène. */
export const cameraApi: { zoom: (factor: number) => void; recenter: () => void } = {
  zoom: () => {},
  recenter: () => {},
};
