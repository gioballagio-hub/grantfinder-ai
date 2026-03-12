"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { exportReport } from "@/lib/api";

export default function ExportButton({ prompt }: { prompt: string }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: "pdf" | "excel") => {
    setLoading(true);
    try {
      const blob = await exportReport(prompt, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `grantfinder_report.${format === "pdf" ? "pdf" : "xlsx"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleExport("pdf")}
        disabled={loading}
        className="flex items-center gap-1.5 text-sm bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
      >
        <Download size={14} /> PDF
      </button>
      <button
        onClick={() => handleExport("excel")}
        disabled={loading}
        className="flex items-center gap-1.5 text-sm bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg transition"
      >
        <Download size={14} /> Excel
      </button>
    </div>
  );
}
