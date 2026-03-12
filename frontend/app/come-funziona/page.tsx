import { Sparkles, Database, Shield, FileText, Search, Brain, BarChart3, Download } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "1. Descrivi la tua azienda",
    desc: "Scrivi in linguaggio naturale chi sei, cosa fai e che tipo di finanziamento cerchi. Ad esempio: \"Sono una startup biotech in Lombardia, cerco fondi per R&D\".",
  },
  {
    icon: Brain,
    title: "2. L'AI analizza il tuo profilo",
    desc: "Claude AI estrae i parametri chiave: settore, dimensione aziendale, localizzazione, tipo di finanziamento preferito, parole chiave del progetto.",
  },
  {
    icon: Database,
    title: "3. Ricerca multi-fonte",
    desc: "Il sistema cerca simultaneamente tra bandi europei, nazionali e regionali. Ogni bando viene valutato con un algoritmo di scoring multi-fattore.",
  },
  {
    icon: BarChart3,
    title: "4. Ranking intelligente",
    desc: "I risultati vengono ordinati per rilevanza. L'algoritmo considera: match keywords (35%), geografia (20%), dimensione azienda (15%), tipo finanziamento (15%), tipo progetto (10%), scadenza (5%).",
  },
  {
    icon: Sparkles,
    title: "5. Spiegazione AI",
    desc: "Per i top 5 risultati, l'AI genera una spiegazione personalizzata del perché quel bando è rilevante per il tuo caso specifico.",
  },
  {
    icon: Download,
    title: "6. Esporta i risultati",
    desc: "Scarica un report completo in PDF o Excel con tutti i dettagli: importi, scadenze, requisiti, link ufficiali.",
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "Analisi AI",
    desc: "Intelligenza artificiale Claude per comprendere il contesto della tua richiesta e matchare i bandi più pertinenti.",
  },
  {
    icon: Database,
    title: "34+ Fonti Dati",
    desc: "Ricerca simultanea su portali EU (Horizon, LIFE, Digital Europe), nazionali (MISE, PNRR, Invitalia) e regionali.",
  },
  {
    icon: Shield,
    title: "Matching Avanzato",
    desc: "Algoritmo multi-fattore che valuta keywords, geografia, dimensione aziendale, tipo di finanziamento e scadenze.",
  },
  {
    icon: FileText,
    title: "Report Completo",
    desc: "Esporta i risultati in PDF o Excel con punteggio di rilevanza, importi a fondo perduto e link ai bandi ufficiali.",
  },
];

export default function ComeFunziona() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-dark border-b border-dark-border py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-light mb-4">
            Come Funziona <span className="text-gold">GrantFinder AI</span>
          </h1>
          <p className="text-lg text-dark-muted max-w-2xl mx-auto">
            Un motore di ricerca intelligente che trova i finanziamenti pubblici
            più adatti alla tua azienda in pochi secondi.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-light mb-10 text-center">Il processo in 6 step</h2>
        <div className="space-y-6">
          {STEPS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-5 bg-dark-card rounded-2xl border border-dark-border p-6 hover:border-gold/30 transition">
              <div className="flex-shrink-0 w-12 h-12 bg-gold-muted rounded-xl flex items-center justify-center">
                <Icon size={24} className="text-gold" />
              </div>
              <div>
                <h3 className="font-semibold text-light mb-1">{title}</h3>
                <p className="text-sm text-dark-muted leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="bg-dark-card border-t border-dark-border py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10 text-light">Caratteristiche principali</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-dark rounded-xl border border-dark-border p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gold-muted rounded-lg flex items-center justify-center">
                    <Icon size={20} className="text-gold" />
                  </div>
                  <h3 className="font-semibold text-light">{title}</h3>
                </div>
                <p className="text-sm text-dark-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-2xl font-bold text-light mb-4">Pronto a trovare il finanziamento giusto?</h2>
        <p className="text-dark-muted mb-8">Descrivi la tua azienda e lascia che l&apos;AI faccia il resto.</p>
        <a
          href="/"
          className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-dark px-6 py-3 rounded-xl font-medium transition shadow-[0_0_20px_rgba(212,175,55,0.2)]"
        >
          <Search size={18} /> Inizia la ricerca
        </a>
      </section>
    </div>
  );
}
