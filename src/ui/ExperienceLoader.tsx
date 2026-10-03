"use client";
import dynamic from "next/dynamic";

/* Tout le monde 3D est client-only (WebGL, WebAudio, scroll). */
const Experience = dynamic(() => import("./Experience"), { ssr: false, loading: () => <div className="boot">DUQUENNE CITY</div> });
export default Experience;
