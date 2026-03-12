"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, DollarSign, ExternalLink, MapPin, Users } from "lucide-react";
import { getFunding, type FundingResult } from "@/lib/api";
import ScoreBadge from "@/components/ScoreBadge";

function formatAmount(n: number | null): string {
  if (!n) return "N/D";
  return `€${n.toLocaleString("it-IT")}`;
}

export default function FundingDetail() {
  const { id } = useParams();
  const [funding, setFunding] = useState<FundingResult | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (id) {
      getFunding(id as string)
        .then(setFunding)
        .catch(() => setError(true));
    }
  }, [id]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-dark-muted">Bando non trovato.</p>
        <a href="/" className="text-gold hover:underline mt-2 inline-block">Torna alla ricerca</a>
      </div>
    );
  }

  if (!funding) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const typeLabel: Record<string, string> = {
    grant: "Contributo a fondo perduto",
    loan: "Prestito agevolato",
    tax_credit: "Credito d'imposta",
    mixed: "Misto (contributo + prestito)",
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <a href="/" className="inline-flex items-center gap-1 text-sm text-gold hover:text-gold-light mb-6">
        <ArrowLeft size={16} /> Torna ai risultati
      </a>

      <div className="bg-dark-card rounded-2xl border border-dark-border p-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-gold font-medium mb-1">{funding.program}</p>
            <h1 className="text-2xl font-bold text-light">{funding.title}</h1>
            <p className="text-sm text-dark-muted mt-1">{funding.organization}</p>
          </div>
          {funding.relevance_score > 0 && <ScoreBadge score={funding.relevance_score} />}
        </div>

        {funding.description && (
          <p className="text-dark-muted leading-relaxed mb-6">{funding.description}</p>
        )}

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <InfoBox icon={DollarSign} label="Importo">
            {formatAmount(funding.min_grant)} — {formatAmount(funding.max_grant)}
            {funding.funding_percentage && (
              <span className="block text-sm text-dark-muted">Cofinanziamento: {funding.funding_percentage}%</span>
            )}
          </InfoBox>
          <InfoBox icon={Calendar} label="Scadenza">
            {funding.deadline ? new Date(funding.deadline).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" }) : "Non specificata"}
          </InfoBox>
          <InfoBox icon={Users} label="Tipo finanziamento">
            {funding.funding_type ? typeLabel[funding.funding_type] || funding.funding_type : "N/D"}
          </InfoBox>
          <InfoBox icon={MapPin} label="Ambito geografico">
            {funding.geographic_scope?.join(", ") || "N/D"}
          </InfoBox>
        </div>

        {funding.eligibility_text && (
          <div className="mb-6">
            <h3 className="font-semibold text-light mb-2">Requisiti di ammissibilita&apos;</h3>
            <p className="text-sm text-dark-muted bg-dark-lighter rounded-lg p-4 border border-dark-border">{funding.eligibility_text}</p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-semibold text-light mb-2">Destinatari</h3>
          <div className="flex flex-wrap gap-2">
            {funding.company_size?.map((s) => (
              <span key={s} className="text-xs bg-gold-muted text-gold px-2.5 py-1 rounded-full border border-gold/20">
                {s === "micro" ? "Micro impresa" : s === "small" ? "Piccola impresa" : s === "medium" ? "Media impresa" : s === "large" ? "Grande impresa" : s === "startup" ? "Startup" : s}
              </span>
            ))}
          </div>
        </div>

        {funding.sector_tags && (
          <div className="mb-6">
            <h3 className="font-semibold text-light mb-2">Settori</h3>
            <div className="flex flex-wrap gap-2">
              {funding.sector_tags.map((tag) => (
                <span key={tag} className="text-xs bg-dark-lighter text-dark-muted px-2.5 py-1 rounded-full border border-dark-border">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {funding.url && (
          <a
            href={funding.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-dark px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-[0_0_20px_rgba(212,175,55,0.2)]"
          >
            Vai al sito ufficiale <ExternalLink size={16} />
          </a>
        )}
      </div>
    </div>
  );
}

function InfoBox({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="bg-dark-lighter rounded-xl p-4 border border-dark-border">
      <div className="flex items-center gap-2 text-sm text-dark-muted mb-1">
        <Icon size={14} className="text-gold" /> {label}
      </div>
      <div className="text-light font-medium">{children}</div>
    </div>
  );
}
