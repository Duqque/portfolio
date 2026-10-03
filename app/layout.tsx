import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DUQUENNE CITY — A life under construction",
  description: "Une ville 3D qui se construit au fil du scroll pour raconter une vie. Chapitre I — Fondation.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0b0d1a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
