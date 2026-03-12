"use client";

import { useState } from "react";
import { Sparkles, Database, FileText, Shield } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import FundingCard from "@/components/FundingCard";
import ParamsDisplay from "@/components/ParamsDisplay";
import ExportButton from "@/components/ExportButton";
import type { SearchResponse } from "@/lib/api";
import { searchFunding } from "@/lib/api";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (userPrompt: string) => {
    setPrompt(userPrompt);
    setLoading(true);
    setError(null);
    try {
      const data = await searchFunding(userPrompt);
      setResult(data);
    } catch (e) {
      setError("Errore nella ricerca. Verifica che il backend sia attivo.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      {!result && (
        <section className="bg-dark py-20 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.08)_0%,_transparent_60%)]" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-light">
              Trova il finanziamento giusto
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-gold-light">
                con l&apos;intelligenza artificiale
              </span>
            </h1>
            <p className="text-lg text-dark-muted mb-10 max-w-2xl mx-auto">
              Descrivi la tua azienda e il tuo progetto. GrantFinder AI analizza il tuo profilo
              e cerca tra centinaia di bandi europei, nazionali e regionali.
            </p>
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>
        </section>
      )}

      {/* Compact search when results are shown */}
      {result && (
        <section className="bg-dark border-b border-dark-border py-6 px-6">
          <div className="max-w-4xl mx-auto">
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>
        </section>
      )}

      {/* Error */}
      {error && (
        <div className="max-w-4xl mx-auto mt-6 px-6">
          <div className="bg-red-900/20 border border-red-800/30 text-red-400 rounded-xl p-4 text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <section className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-light">
                {result.total_results} finanziamenti trovati
              </h2>
              <p className="text-sm text-dark-muted">Ordinati per rilevanza</p>
            </div>
            <ExportButton prompt={prompt} />
          </div>

          <ParamsDisplay params={result.extracted_params} />

          <div className="mt-6 space-y-4">
            {result.results.map((funding) => (
              <FundingCard key={funding.id} funding={funding} />
            ))}
          </div>

          {result.total_results === 0 && (
            <div className="text-center py-16 text-dark-muted">
              <p className="text-lg">Nessun bando trovato per la tua ricerca.</p>
              <p className="text-sm mt-2">Prova a descrivere la tua azienda in modo piu&apos; dettagliato.</p>
            </div>
          )}
        </section>
      )}

      {/* Features - only on homepage */}
      {!result && (
        <section className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-center mb-10 text-light">Come funziona</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Sparkles, title: "Analisi AI", desc: "L'AI analizza il tuo profilo ed estrae parametri chiave: settore, dimensione, localizzazione." },
              { icon: Database, title: "34+ Fonti Dati", desc: "Ricerca simultanea su portali EU, nazionali e regionali. Dati sempre aggiornati." },
              { icon: Shield, title: "Matching Semantico", desc: "Calcola la compatibilita' semantica tra il tuo progetto e ogni bando disponibile." },
              { icon: FileText, title: "Report Completo", desc: "Esporta i risultati in PDF o Excel con punteggio, importi e link ufficiali." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-12 h-12 bg-gold-muted rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon size={24} className="text-gold" />
                </div>
                <h3 className="font-semibold text-light mb-1">{title}</h3>
                <p className="text-sm text-dark-muted">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
