const API_BASE = "/api";

export interface ExtractedParams {
  company_type: string | null;
  sector: string | null;
  application_sector: string | null;
  location: string | null;
  funding_type: string | null;
  project_type: string | null;
  keywords: string[];
  geographic_preferences: string[];
}

export interface FundingResult {
  id: string;
  title: string;
  program: string | null;
  organization: string | null;
  source: string;
  url: string | null;
  description: string | null;
  sector_tags: string[] | null;
  company_size: string[] | null;
  geographic_scope: string[] | null;
  funding_type: string | null;
  project_type: string[] | null;
  min_grant: number | null;
  max_grant: number | null;
  funding_percentage: number | null;
  total_budget: number | null;
  opening_date: string | null;
  deadline: string | null;
  eligibility_text: string | null;
  status: string;
  relevance_score: number;
  why_relevant: string | null;
  grant_amount: number;
  category: "eu" | "national" | "regional";
}

export interface SearchResponse {
  extracted_params: ExtractedParams;
  results: FundingResult[];
  total_results: number;
}

export async function searchFunding(prompt: string): Promise<SearchResponse> {
  const res = await fetch(`${API_BASE}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return res.json();
}

export async function getFunding(id: string): Promise<FundingResult> {
  const res = await fetch(`${API_BASE}/funding/${id}`);
  if (!res.ok) throw new Error(`Funding not found: ${res.status}`);
  return res.json();
}

export async function exportReport(prompt: string, format: "pdf" | "excel"): Promise<Blob> {
  const res = await fetch(`${API_BASE}/export/${format}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error(`Export failed: ${res.status}`);
  return res.blob();
}
