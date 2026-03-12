"use client";

import { useEffect, useState } from "react";
import { Globe, Flag, MapPin, Database, Calendar, DollarSign, Search, ArrowUpDown, TrendingUp, ExternalLink } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import ScoreBadge from "@/components/ScoreBadge";

type CategoryTab = "all" | "eu" | "national" | "regional";
type FundingType = "all" | "grant" | "loan" | "tax_credit" | "mixed";
type SortMode = "deadline" | "grant_desc" | "name";

interface FundingCall {
  id: string;
  title: string;
  program: string | null;
  organization: string | null;
  source: string;
  url: string | null;
  description: string | null;
  sector_tags: string[] | null;
  company_size: string[] | null;
  geographic_scope: string[] | null;
  funding_type: string | null;
  min_grant: number | null;
  max_grant: number | null;
  funding_percentage: number | null;
  deadline: string | null;
  status: string;
  eligibility_text: string | null;
}

const CATEGORY_CONFIG: Record<CategoryTab, { label: string; icon: any; color: string }> = {
  all: { label: "Tutti", icon: Database, color: "text-gold" },
  eu: { label: "Europei", icon: Globe, color: "text-blue-400" },
  national: { label: "Nazionali", icon: Flag, color: "text-green-400" },
  regional: { label: "Regionali", icon: MapPin, color: "text-orange-400" },
};

const TYPE_CONFIG: Record<FundingType, string> = {
  all: "Tutti i tipi",
  grant: "Contributo a fondo perduto",
  loan: "Prestito agevolato",
  tax_credit: "Credito d'imposta",
  mixed: "Misto",
};

const typeColors: Record<string, string> = {
  grant: "bg-green-900/20 text-green-400 border-green-800/30",
  loan: "bg-blue-900/20 text-blue-400 border-blue-800/30",
  tax_credit: "bg-purple-900/20 text-purple-400 border-purple-800/30",
  mixed: "bg-gold-muted text-gold border-gold/20",
};

function formatAmount(n: number | null): string {
  if (!n) return "N/D";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString("it-IT");
}

function getCategory(source: string, geo: string[]): string {
  if (source === "eu_funding_tenders" || (geo || []).some((g) => g === "EU")) return "eu";
  if (source === "regional" || (geo || []).some((g) => !["EU", "IT"].includes(g) && g.length > 2)) return "regional";
  return "national";
}

export default function BandiPage() {
  const [calls, setCalls] = useState<FundingCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<CategoryTab>("all");
  const [fundingType, setFundingType] = useState<FundingType>("all");
  const [sortMode, setSortMode] = useState<SortMode>("deadline");

  useEffect(() => {
    supabaseBrowser
      .from("funding_calls")
      .select("*")
      .eq("status", "open")
      .order("deadline", { ascending: true, nullsFirst: false })
      .then(({ data, error }) => {
        if (!error && data) setCalls(data);
        setLoading(false);
      });
  }, []);

  // Add category to each call
  const callsWithCategory = calls.map((c) => ({
    ...c,
    category: getCategory(c.source, c.geographic_scope || []),
  }));

  // Filter by search text
  const textFiltered = searchText.trim()
    ? callsWithCategory.filter((c) => {
        const q = searchText.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q) ||
          (c.program || "").toLowerCase().includes(q) ||
          (c.sector_tags || []).some((t) => t.toLowerCase().includes(q))
        );
      })
    : callsWithCategory;

  // Filter by category
  const catFiltered = activeTab === "all" ? textFiltered : textFiltered.filter((c) => c.category === activeTab);

  // Filter by funding type
  const typeFiltered = fundingType === "all" ? catFiltered : catFiltered.filter((c) => c.funding_type === fundingType);

  // Sort
  const sorted = [...typeFiltered].sort((a, b) => {
    if (sortMode === "grant_desc") return (b.max_grant || 0) - (a.max_grant || 0);
    if (sortMode === "name") return a.title.localeCompare(b.title);
    // deadline
    const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
    const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
    return da - db;
  });

  // Counts
  const categoryCounts = {
    all: textFiltered.length,
    eu: textFiltered.filter((c) => c.category === "eu").length,
    national: textFiltered.filter((c) => c.category === "national").length,
    regional: textFiltered.filter((c) => c.category === "regional").length,
  };

  // Stats
  const totalBudget = sorted.reduce((s, c) => s + (c.max_grant || 0), 0);
  const grantCount = sorted.filter((c) => c.funding_type === "grant").length;

  return (
    <div>
      {/* Header */}
      <section className="bg-dark border-b border-dark-border py-8 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-light mb-2">
            Catalogo Bandi
          </h1>
          <p className="text-dark-muted mb-6">
            Consulta tutti i bandi disponibili. Filtra per categoria, tipo e cerca per parola chiave.
          </p>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Cerca per titolo, settore, programma..."
              className="w-full pl-10 pr-4 py-3 bg-dark-lighter border border-dark-border rounded-xl text-light placeholder:text-dark-muted focus:outline-none focus:border-gold/50 transition"
            />
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-dark-muted mt-4">Caricamento bandi...</p>
          </div>
        ) : (
          <>
            {/* Stats bar */}
            <div className="flex items-center gap-6 mb-6 text-sm text-dark-muted">
              <span><strong className="text-light">{calls.length}</strong> bandi totali</span>
              <span><strong className="text-green-400">{grantCount}</strong> a fondo perduto</span>
              <span>Budget max totale: <strong className="text-gold">{formatAmount(totalBudget)}</strong></span>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1 border-b border-dark-border pb-0 overflow-x-auto">
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

            {/* Filters row */}
            <div className="flex items-center gap-4 mt-4 mb-6 flex-wrap">
              {/* Funding type filter */}
              <div className="flex items-center gap-2">
                <DollarSign size={14} className="text-dark-muted" />
                <select
                  value={fundingType}
                  onChange={(e) => setFundingType(e.target.value as FundingType)}
                  className="text-xs bg-dark-lighter text-light border border-dark-border rounded-lg px-3 py-1.5 focus:outline-none focus:border-gold/50"
                >
                  {Object.entries(TYPE_CONFIG).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <ArrowUpDown size={14} className="text-dark-muted" />
                <span className="text-xs text-dark-muted">Ordina:</span>
                {([
                  { key: "deadline" as SortMode, label: "Scadenza" },
                  { key: "grant_desc" as SortMode, label: "Importo max" },
                  { key: "name" as SortMode, label: "Nome" },
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
            </div>

            {/* Results count */}
            <p className="text-sm text-dark-muted mb-4">
              {sorted.length} bandi trovati
            </p>

            {/* Cards */}
            <div className="space-y-4">
              {sorted.map((call) => (
                <div
                  key={call.id}
                  className="bg-dark-card rounded-2xl border border-dark-border hover:border-gold/30 transition-all p-6 group"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {call.funding_type && (
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${typeColors[call.funding_type] || "bg-dark-lighter text-dark-muted border-dark-border"}`}>
                            {TYPE_CONFIG[call.funding_type as FundingType] || call.funding_type}
                          </span>
                        )}
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                          call.category === "eu"
                            ? "bg-blue-900/20 text-blue-400 border-blue-800/30"
                            : call.category === "regional"
                            ? "bg-orange-900/20 text-orange-400 border-orange-800/30"
                            : "bg-green-900/20 text-green-400 border-green-800/30"
                        }`}>
                          {call.category === "eu" ? "Europeo" : call.category === "regional" ? "Regionale" : "Nazionale"}
                        </span>
                        {call.program && (
                          <span className="text-[11px] text-dark-muted">{call.program}</span>
                        )}
                      </div>
                      <a
                        href={`/funding/${call.id}`}
                        className="text-lg font-semibold text-light group-hover:text-gold transition line-clamp-2"
                      >
                        {call.title}
                      </a>
                      {call.organization && (
                        <p className="text-xs text-dark-muted mt-0.5">{call.organization}</p>
                      )}
                    </div>
                  </div>

                  {call.description && (
                    <p className="text-sm text-dark-muted line-clamp-2 mb-4">{call.description}</p>
                  )}

                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-dark-muted mb-4">
                    <span className="flex items-center gap-1">
                      <DollarSign size={14} className="text-gold" />
                      {call.min_grant || call.max_grant
                        ? `€${formatAmount(call.min_grant)} — €${formatAmount(call.max_grant)}`
                        : "Variabile"}
                      {call.funding_percentage && ` (${call.funding_percentage}%)`}
                    </span>
                    {call.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar size={14} className="text-gold" />
                        {new Date(call.deadline).toLocaleDateString("it-IT", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    {call.geographic_scope && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14} className="text-gold" />
                        {call.geographic_scope.slice(0, 3).join(", ")}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {call.sector_tags?.slice(0, 4).map((tag) => (
                        <span key={tag} className="text-[11px] bg-dark-lighter text-dark-muted px-2 py-0.5 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <a
                        href={`/funding/${call.id}`}
                        className="text-xs text-gold hover:text-gold-light transition"
                      >
                        Dettagli
                      </a>
                      {call.url && (
                        <a
                          href={call.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-dark-muted hover:text-gold flex items-center gap-1 transition"
                        >
                          Sito ufficiale <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {sorted.length === 0 && (
              <div className="text-center py-16 text-dark-muted">
                <p className="text-lg">Nessun bando trovato con i filtri selezionati.</p>
                <p className="text-sm mt-2">Prova a modificare i filtri o la ricerca.</p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
