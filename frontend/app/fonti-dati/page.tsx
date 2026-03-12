"use client";

import { useEffect, useState } from "react";
import { Globe, Flag, MapPin, Database, ExternalLink, RefreshCw } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

interface DataSource {
  id: string;
  name: string;
  url: string | null;
  source_type: string | null;
  geographic_scope: string | null;
  description: string | null;
  update_frequency: string | null;
  status: string | null;
}

const scopeConfig: Record<string, { label: string; icon: any; color: string; badgeClass: string }> = {
  eu: { label: "Europeo", icon: Globe, color: "text-blue-400", badgeClass: "bg-blue-900/20 text-blue-400 border-blue-800/30" },
  national: { label: "Nazionale", icon: Flag, color: "text-green-400", badgeClass: "bg-green-900/20 text-green-400 border-green-800/30" },
  regional: { label: "Regionale", icon: MapPin, color: "text-orange-400", badgeClass: "bg-orange-900/20 text-orange-400 border-orange-800/30" },
};

export default function FontiDatiPage() {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "eu" | "national" | "regional">("all");

  useEffect(() => {
    supabaseBrowser
      .from("data_sources")
      .select("*")
      .order("name", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setSources(data);
        setLoading(false);
      });
  }, []);

  const filtered = filter === "all" ? sources : sources.filter((s) => s.geographic_scope === filter);

  const counts = {
    all: sources.length,
    eu: sources.filter((s) => s.geographic_scope === "eu").length,
    national: sources.filter((s) => s.geographic_scope === "national").length,
    regional: sources.filter((s) => s.geographic_scope === "regional").length,
  };

  return (
    <div>
      {/* Header */}
      <section className="bg-dark border-b border-dark-border py-8 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-light mb-2">
            Fonti Dati
          </h1>
          <p className="text-dark-muted">
            GrantFinder AI monitora costantemente queste fonti per trovare i bandi più aggiornati.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-dark-muted mt-4">Caricamento fonti...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="flex items-center gap-6 mb-6 text-sm text-dark-muted">
              <span className="flex items-center gap-2">
                <Database size={14} className="text-gold" />
                <strong className="text-light">{sources.length}</strong> fonti monitorate
              </span>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 border-b border-dark-border pb-0 overflow-x-auto mb-6">
              {(["all", "eu", "national", "regional"] as const).map((scope) => {
                const isActive = filter === scope;
                const label = scope === "all" ? "Tutte" : scopeConfig[scope]?.label || scope;
                const Icon = scope === "all" ? Database : scopeConfig[scope]?.icon || Database;
                return (
                  <button
                    key={scope}
                    onClick={() => setFilter(scope)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition whitespace-nowrap border-b-2 -mb-[1px] ${
                      isActive
                        ? "border-gold text-gold"
                        : "border-transparent text-dark-muted hover:text-light hover:border-dark-border"
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-gold/20 text-gold" : "bg-dark-lighter text-dark-muted"
                    }`}>
                      {counts[scope]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sources grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((source) => {
                const scope = scopeConfig[source.geographic_scope || ""] || null;
                return (
                  <div
                    key={source.id}
                    className="bg-dark-card rounded-xl border border-dark-border p-5 hover:border-gold/30 transition"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-light text-sm">{source.name}</h3>
                      {scope && (
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${scope.badgeClass}`}>
                          {scope.label}
                        </span>
                      )}
                    </div>
                    {source.description && (
                      <p className="text-xs text-dark-muted mb-3 line-clamp-2">{source.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-dark-muted">
                        {source.source_type && (
                          <span className="bg-dark-lighter px-2 py-0.5 rounded">{source.source_type}</span>
                        )}
                        {source.update_frequency && (
                          <span className="flex items-center gap-1">
                            <RefreshCw size={10} /> {source.update_frequency}
                          </span>
                        )}
                      </div>
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gold hover:text-gold-light flex items-center gap-1 transition"
                        >
                          Visita <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-dark-muted">
                <p>Nessuna fonte trovata per questa categoria.</p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
