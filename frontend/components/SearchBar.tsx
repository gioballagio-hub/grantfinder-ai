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
            className="w-full px-5 py-4 pr-14 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none resize-none transition"
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="absolute right-3 bottom-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-xl p-3 transition shadow-md"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search size={20} />
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-xs text-gray-400">Esempi:</span>
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => { setPrompt(ex); onSearch(ex); }}
            className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 hover:border-primary-400 hover:text-primary-700 transition truncate max-w-[280px]"
          >
            {ex.slice(0, 60)}...
          </button>
        ))}
      </div>
    </div>
  );
}
