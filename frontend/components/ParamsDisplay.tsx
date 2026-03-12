import { Brain } from "lucide-react";
import type { ExtractedParams } from "@/lib/api";

export default function ParamsDisplay({ params }: { params: ExtractedParams }) {
  const items = [
    { label: "Tipo azienda", value: params.company_type },
    { label: "Settore", value: params.sector },
    { label: "Applicazione", value: params.application_sector },
    { label: "Localizzazione", value: params.location },
    { label: "Tipo finanziamento", value: params.funding_type },
    { label: "Tipo progetto", value: params.project_type },
  ].filter((i) => i.value);

  return (
    <div className="bg-gold-muted rounded-xl p-4 border border-gold/20">
      <div className="flex items-center gap-2 mb-3">
        <Brain size={16} className="text-gold" />
        <span className="text-sm font-semibold text-gold">Analisi AI del tuo profilo</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map(({ label, value }) => (
          <span key={label} className="text-xs bg-dark-card border border-dark-border rounded-full px-3 py-1 text-light">
            <span className="font-medium text-gold">{label}:</span> {value}
          </span>
        ))}
        {params.keywords.length > 0 && params.keywords.map((kw) => (
          <span key={kw} className="text-xs bg-gold/10 rounded-full px-3 py-1 text-gold font-medium">
            {kw}
          </span>
        ))}
      </div>
    </div>
  );
}
