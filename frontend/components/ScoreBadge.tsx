export default function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    pct >= 80 ? "bg-gold-muted text-gold border border-gold/20" :
    pct >= 60 ? "bg-gold-muted text-gold-light border border-gold/10" :
    "bg-dark-lighter text-dark-muted border border-dark-border";

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
      {pct}% match
    </span>
  );
}
