"use client";

import { Search } from "lucide-react";
import { useState } from "react";

const EXAMPLES = [
  "Siamo una PMI in Emilia-Romagna che sviluppa soluzioni AI per il manifatturiero. Cerchiamo fondi per R&D e digitalizzazione.",
  "Startup innovativa a Milano, settore biotech. Cerchiamo grant europei e nazionali per ricerca.",
  "Azienda media nel Mezzogiorno, settore agroalimentare. Cerchiamo finanziamenti per transizione digitale e sostenibilita'.",
];

export default function SearchBar({
  onSearch,
  loading,
}: {
  onSearch: (prompt: string) => void;
  loading: boolean;
}) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) onSearch(prompt.trim());
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Descrivi la tua azienda e il progetto per cui cerchi finanziamenti..."
            rows={5}
            className="w-full px-5 py-4 pr-14 text-base bg-dark-card border border-dark-border rounded-2xl text-light placeholder-dark-muted focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none resize-none transition"
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="absolute right-3 bottom-3 bg-gold hover:bg-gold-light disabled:bg-dark-lighter disabled:text-dark-muted text-dark rounded-xl p-3 transition shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-dark border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search size={20} />
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-xs text-dark-muted">Esempi:</span>
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => { setPrompt(ex); onSearch(ex); }}
            className="text-xs bg-dark-lighter border border-dark-border text-dark-muted rounded-full px-3 py-1.5 hover:border-gold hover:text-gold transition truncate max-w-[280px]"
          >
            {ex.slice(0, 60)}...
          </button>
        ))}
      </div>
    </div>
  );
}
