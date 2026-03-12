export default function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    pct >= 80 ? "bg-green-100 text-green-800" :
    pct >= 60 ? "bg-yellow-100 text-yellow-800" :
    "bg-gray-100 text-gray-600";

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
      {pct}% match
    </span>
  );
}
