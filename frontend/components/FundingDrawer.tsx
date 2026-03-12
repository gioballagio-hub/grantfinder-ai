"use client";

import { useEffect, useState } from "react";
import { X, Calendar, DollarSign, ExternalLink, MapPin, Users } from "lucide-react";
import { type FundingResult } from "@/lib/api";
import { supabaseBrowser } from "@/lib/supabase-browser";
import ScoreBadge from "@/components/ScoreBadge";

function formatAmount(n: number | null): string {
  if (!n) return "N/D";
  return `€${n.toLocaleString("it-IT")}`;
}

const typeLabel: Record<string, string> = {
  grant: "Contributo a fondo perduto",
  loan: "Prestito agevolato",
  tax_credit: "Credito d'imposta",
  mixed: "Misto (contributo + prestito)",
};

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

interface FundingDrawerProps {
  fundingId: string | null;
  searchResult?: FundingResult | null;
  onClose: () => void;
}

export default function FundingDrawer({ fundingId, searchResult, onClose }: FundingDrawerProps) {
  const [funding, setFunding] = useState<FundingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const isOpen = !!fundingId;

  useEffect(() => {
    if (!fundingId) {
      setFunding(null);
      return;
    }

    // If we have the search result with data, use it directly
    if (searchResult) {
      setFunding(searchResult);
      return;
    }

    // Otherwise fetch from Supabase
    setLoading(true);
    setError(false);
    supabaseBrowser
      .from("funding_calls")
      .select("*")
      .eq("id", fundingId)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError(true);
        } else {
          setFunding({ ...data, relevance_score: 0, why_relevant: null } as FundingResult);
        }
        setLoading(false);
      });
  }, [fundingId, searchResult]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[301] w-full max-w-2xl bg-dark border-l border-dark-border shadow-2xl transition-transform duration-300 ease-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-dark/95 backdrop-blur-md border-b border-dark-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-sm font-medium text-dark-muted">Dettaglio Bando</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-lighter text-dark-muted hover:text-light transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <p className="text-dark-muted">Bando non trovato.</p>
            </div>
          )}

          {funding && !loading && (
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gold font-medium mb-1">{funding.program}</p>
                  <h1 className="text-2xl font-bold text-light">{funding.title}</h1>
                  <p className="text-sm text-dark-muted mt-1">{funding.organization}</p>
                </div>
                {funding.relevance_score > 0 && <ScoreBadge score={funding.relevance_score} />}
              </div>

              {funding.why_relevant && (
                <p className="text-sm text-gold bg-gold-muted rounded-lg px-4 py-3 mb-6 border border-gold/20">
                  {funding.why_relevant}
                </p>
              )}

              {funding.description && (
                <p className="text-dark-muted leading-relaxed mb-6">{funding.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <InfoBox icon={DollarSign} label="Importo">
                  {formatAmount(funding.min_grant)} — {formatAmount(funding.max_grant)}
                  {funding.funding_percentage && (
                    <span className="block text-sm text-dark-muted">Cofinanziamento: {funding.funding_percentage}%</span>
                  )}
                </InfoBox>
                <InfoBox icon={Calendar} label="Scadenza">
                  {funding.deadline
                    ? new Date(funding.deadline).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })
                    : "Non specificata"}
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
                  <h3 className="font-semibold text-light mb-2">Requisiti di ammissibilit&agrave;</h3>
                  <p className="text-sm text-dark-muted bg-dark-lighter rounded-lg p-4 border border-dark-border">
                    {funding.eligibility_text}
                  </p>
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
                      <span key={tag} className="text-xs bg-dark-lighter text-dark-muted px-2.5 py-1 rounded-full border border-dark-border">
                        {tag}
                      </span>
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
            </>
          )}
        </div>
      </div>
    </>
  );
}
