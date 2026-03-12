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
        <nav className="bg-primary-900 text-white px-6 py-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <a href="/" className="text-xl font-bold tracking-tight">
              GrantFinder <span className="text-accent-500">AI</span>
            </a>
            <div className="flex gap-6 text-sm">
              <a href="/" className="hover:text-accent-500 transition">Cerca</a>
              <a href="#" className="hover:text-accent-500 transition">Fonti Dati</a>
              <a href="#" className="hover:text-accent-500 transition">Come Funziona</a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-gray-100 border-t mt-20 py-8 text-center text-sm text-gray-500">
          GrantFinder AI &mdash; Powered by Claude &amp; Voyage AI
        </footer>
      </body>
    </html>
  );
}
