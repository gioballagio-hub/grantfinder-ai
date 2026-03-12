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
    grant: "bg-green-50 text-green-700 border-green-200",
    loan: "bg-blue-50 text-blue-700 border-blue-200",
    tax_credit: "bg-purple-50 text-purple-700 border-purple-200",
    mixed: "bg-orange-50 text-orange-700 border-orange-200",
  };

  const typeLabel: Record<string, string> = {
    grant: "Contributo",
    loan: "Prestito agevolato",
    tax_credit: "Credito d'imposta",
    mixed: "Misto",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 group">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {funding.funding_type && (
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${typeColors[funding.funding_type] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                {typeLabel[funding.funding_type] || funding.funding_type}
              </span>
            )}
            <span className="text-[11px] text-gray-400">{funding.program}</span>
          </div>
          <a
            href={`/funding/${funding.id}`}
            className="text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition line-clamp-2"
          >
            {funding.title}
          </a>
        </div>
        <ScoreBadge score={funding.relevance_score} />
      </div>

      {funding.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{funding.description}</p>
      )}

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <DollarSign size={14} />
          {funding.min_grant || funding.max_grant
            ? `€${formatAmount(funding.min_grant)} — €${formatAmount(funding.max_grant)}`
            : "Variabile"}
          {funding.funding_percentage && ` (${funding.funding_percentage}%)`}
        </span>
        {funding.deadline && (
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {new Date(funding.deadline).toLocaleDateString("it-IT")}
          </span>
        )}
        {funding.geographic_scope && (
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {funding.geographic_scope.slice(0, 3).join(", ")}
          </span>
        )}
      </div>

      {funding.why_relevant && (
        <p className="text-sm text-primary-700 bg-primary-50 rounded-lg px-3 py-2 mb-3">
          {funding.why_relevant}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {funding.sector_tags?.slice(0, 4).map((tag) => (
            <span key={tag} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
              {tag}
            </span>
          ))}
        </div>
        {funding.url && (
          <a
            href={funding.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1 transition"
          >
            Sito ufficiale <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}
