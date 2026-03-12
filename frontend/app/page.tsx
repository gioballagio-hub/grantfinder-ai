"use client";

import { useState } from "react";
import { Sparkles, Database, FileText, Shield, Globe, Flag, MapPin, ArrowUpDown, TrendingUp } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import FundingCard from "@/components/FundingCard";
import ParamsDisplay from "@/components/ParamsDisplay";
import ExportButton from "@/components/ExportButton";
import type { SearchResponse, FundingResult } from "@/lib/api";
import { searchFunding } from "@/lib/api";

type SortMode = "relevance" | "grant_amount" | "deadline";
type CategoryTab = "all" | "eu" | "national" | "regional";

const CATEGORY_CONFIG: Record<CategoryTab, { label: string; icon: any; color: string }> = {
  all: { label: "Tutti", icon: Database, color: "text-gold" },
  eu: { label: "Europei", icon: Globe, color: "text-blue-400" },
  national: { label: "Nazionali", icon: Flag, color: "text-green-400" },
  regional: { label: "Regionali", icon: MapPin, color: "text-orange-400" },
};

function formatAmount(n: number): string {
  if (!n) return "€0";
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `€${(n / 1_000).toFixed(0)}K`;
  return `€${n.toLocaleString("it-IT")}`;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CategoryTab>("all");
  const [sortMode, setSortMode] = useState<SortMode>("relevance");

  const handleSearch = async (userPrompt: string) => {
    setPrompt(userPrompt);
    setLoading(true);
    setError(null);
    setActiveTab("all");
    setSortMode("relevance");
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

  // Filtra per categoria
  const filteredResults = result?.results.filter((f) =>
    activeTab === "all" ? true : f.category === activeTab
  ) || [];

  // Ordina
  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortMode === "grant_amount") return (b.grant_amount || 0) - (a.grant_amount || 0);
    if (sortMode === "deadline") {
      const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return da - db;
    }
    return b.relevance_score - a.relevance_score;
  });

  // Conta per categoria
  const categoryCounts = {
    all: result?.results.length || 0,
    eu: result?.results.filter(f => f.category === "eu").length || 0,
    national: result?.results.filter(f => f.category === "national").length || 0,
    regional: result?.results.filter(f => f.category === "regional").length || 0,
  };

  // Stats
  const topGrantAmount = sortedResults.length > 0
    ? Math.max(...sortedResults.map(f => f.grant_amount || 0))
    : 0;
  const avgScore = sortedResults.length > 0
    ? sortedResults.reduce((s, f) => s + f.relevance_score, 0) / sortedResults.length
    : 0;

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
          <div className="max-w-5xl mx-auto">
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>
        </section>
      )}

      {/* Error */}
      {error && (
        <div className="max-w-5xl mx-auto mt-6 px-6">
          <div className="bg-red-900/20 border border-red-800/30 text-red-400 rounded-xl p-4 text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <section className="max-w-5xl mx-auto px-6 py-8">
          {/* Header con stats */}
          <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-light">
                {result.total_results} finanziamenti trovati
              </h2>
              <p className="text-sm text-dark-muted mt-1">
                Fino a {formatAmount(topGrantAmount)} a fondo perduto &middot; Match medio {Math.round(avgScore * 100)}%
              </p>
            </div>
            <ExportButton prompt={prompt} />
          </div>

          <ParamsDisplay params={result.extracted_params} />

          {/* Category Tabs */}
          <div className="mt-6 flex items-center gap-1 border-b border-dark-border pb-0 overflow-x-auto">
            {(Object.keys(CATEGORY_CONFIG) as CategoryTab[]).map((cat) => {
              const { label, icon: Icon, color } = CATEGORY_CONFIG[cat];
              const count = categoryCounts[cat];
              const isActive = activeTab === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition whitespace-nowrap border-b-2 -mb-[1px] ${
                    isActive
                      ? "border-gold text-gold"
                      : "border-transparent text-dark-muted hover:text-light hover:border-dark-border"
                  }`}
                >
                  <Icon size={16} className={isActive ? "text-gold" : color} />
                  {label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-gold/20 text-gold" : "bg-dark-lighter text-dark-muted"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort controls */}
          <div className="flex items-center gap-2 mt-4 mb-4">
            <ArrowUpDown size={14} className="text-dark-muted" />
            <span className="text-xs text-dark-muted">Ordina per:</span>
            {([
              { key: "relevance" as SortMode, label: "Rilevanza", icon: TrendingUp },
              { key: "grant_amount" as SortMode, label: "Importo fondo perduto", icon: TrendingUp },
              { key: "deadline" as SortMode, label: "Scadenza", icon: TrendingUp },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortMode(key)}
                className={`text-xs px-3 py-1.5 rounded-full transition ${
                  sortMode === key
                    ? "bg-gold/20 text-gold border border-gold/30"
                    : "bg-dark-lighter text-dark-muted border border-dark-border hover:text-light"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Funding cards */}
          <div className="space-y-4">
            {sortedResults.map((funding, idx) => (
              <FundingCard key={funding.id} funding={funding} rank={idx + 1} />
            ))}
          </div>

          {sortedResults.length === 0 && (
            <div className="text-center py-16 text-dark-muted">
              <p className="text-lg">Nessun bando in questa categoria.</p>
              <p className="text-sm mt-2">Prova a selezionare &quot;Tutti&quot; o modifica la ricerca.</p>
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
              { icon: Shield, title: "Matching Avanzato", desc: "Algoritmo multi-fattore: keywords, geografia, dimensione, tipo finanziamento, scadenza." },
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
