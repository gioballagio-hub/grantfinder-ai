import { Calendar, DollarSign, ExternalLink, MapPin } from "lucide-react";
import type { FundingResult } from "@/lib/api";
import ScoreBadge from "./ScoreBadge";

function formatAmount(n: number | null): string {
  if (!n) return "N/D";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString("it-IT");
}

export default function FundingCard({ funding }: { funding: FundingResult }) {
  const typeColors: Record<string, string> = {
    grant: "bg-green-900/20 text-green-400 border-green-800/30",
    loan: "bg-blue-900/20 text-blue-400 border-blue-800/30",
    tax_credit: "bg-purple-900/20 text-purple-400 border-purple-800/30",
    mixed: "bg-gold-muted text-gold border-gold/20",
  };

  const typeLabel: Record<string, string> = {
    grant: "Contributo",
    loan: "Prestito agevolato",
    tax_credit: "Credito d'imposta",
    mixed: "Misto",
  };

  return (
    <div className="bg-dark-card rounded-2xl border border-dark-border hover:border-gold/30 transition-all p-6 group">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {funding.funding_type && (
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${typeColors[funding.funding_type] || "bg-dark-lighter text-dark-muted border-dark-border"}`}>
                {typeLabel[funding.funding_type] || funding.funding_type}
              </span>
            )}
            <span className="text-[11px] text-dark-muted">{funding.program}</span>
          </div>
          <a
            href={`/funding/${funding.id}`}
            className="text-lg font-semibold text-light group-hover:text-gold transition line-clamp-2"
          >
            {funding.title}
          </a>
        </div>
        <ScoreBadge score={funding.relevance_score} />
      </div>

      {funding.description && (
        <p className="text-sm text-dark-muted line-clamp-2 mb-4">{funding.description}</p>
      )}

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-dark-muted mb-4">
        <span className="flex items-center gap-1">
          <DollarSign size={14} className="text-gold" />
          {funding.min_grant || funding.max_grant
            ? `€${formatAmount(funding.min_grant)} — €${formatAmount(funding.max_grant)}`
            : "Variabile"}
          {funding.funding_percentage && ` (${funding.funding_percentage}%)`}
        </span>
        {funding.deadline && (
          <span className="flex items-center gap-1">
            <Calendar size={14} className="text-gold" />
            {new Date(funding.deadline).toLocaleDateString("it-IT")}
          </span>
        )}
        {funding.geographic_scope && (
          <span className="flex items-center gap-1">
            <MapPin size={14} className="text-gold" />
            {funding.geographic_scope.slice(0, 3).join(", ")}
          </span>
        )}
      </div>

      {funding.why_relevant && (
        <p className="text-sm text-gold bg-gold-muted rounded-lg px-3 py-2 mb-3">
          {funding.why_relevant}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {funding.sector_tags?.slice(0, 4).map((tag) => (
            <span key={tag} className="text-[11px] bg-dark-lighter text-dark-muted px-2 py-0.5 rounded-md">
              {tag}
            </span>
          ))}
        </div>
        {funding.url && (
          <a
            href={funding.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gold hover:text-gold-light flex items-center gap-1 transition"
          >
            Sito ufficiale <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}
