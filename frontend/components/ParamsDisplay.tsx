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
    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
      <div className="flex items-center gap-2 mb-3">
        <Brain size={16} className="text-indigo-600" />
        <span className="text-sm font-semibold text-indigo-800">Analisi AI del tuo profilo</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map(({ label, value }) => (
          <span key={label} className="text-xs bg-white border border-indigo-200 rounded-full px-3 py-1 text-indigo-700">
            <span className="font-medium">{label}:</span> {value}
          </span>
        ))}
        {params.keywords.length > 0 && params.keywords.map((kw) => (
          <span key={kw} className="text-xs bg-indigo-100 rounded-full px-3 py-1 text-indigo-800 font-medium">
            {kw}
          </span>
        ))}
      </div>
    </div>
  );
}
