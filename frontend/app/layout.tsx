import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrantFinder AI — Trova Finanziamenti con l'AI",
  description: "Motore di ricerca AI per bandi e finanziamenti pubblici EU e Italia",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <nav className="bg-dark border-b border-dark-border px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <img src="/logo_AIXUM_senza_sfondo.png" alt="AIXUM" className="h-8" />
              <span className="text-xl font-bold tracking-tight text-light">
                GrantFinder <span className="text-gold">AI</span>
              </span>
            </a>
            <div className="flex gap-6 text-sm">
              <a href="/" className="text-dark-muted hover:text-gold transition">Cerca</a>
              <a href="#" className="text-dark-muted hover:text-gold transition">Fonti Dati</a>
              <a href="#" className="text-dark-muted hover:text-gold transition">Come Funziona</a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-dark-card border-t border-dark-border mt-20 py-8 text-center text-sm text-dark-muted">
          GrantFinder AI &mdash; Powered by AIXUM
        </footer>
      </body>
    </html>
  );
}
