import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "GrantFinder AI — Trova Finanziamenti con l'AI",
  description: "Motore di ricerca AI per bandi e finanziamenti pubblici EU e Italia",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-screen">
            <main className="flex-1">{children}</main>
            <footer className="border-t border-dark-border py-6 text-center text-sm text-dark-muted">
              GrantFinder AI &mdash; Powered by AIXUM
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
