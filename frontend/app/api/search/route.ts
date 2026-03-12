import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

const SYSTEM_PROMPT = `Sei un esperto di finanziamenti pubblici europei e italiani.
Analizza il prompt dell'utente ed estrai i parametri strutturati in formato JSON.

Rispondi SOLO con un JSON valido con questa struttura:
{
    "company_type": "micro|small|medium|large|startup|null",
    "sector": "settore principale dell'azienda",
    "application_sector": "settore di applicazione del progetto",
    "location": "localizzazione dell'azienda (regione/paese)",
    "funding_type": "grant|loan|tax_credit|mixed|null",
    "project_type": "R&D|innovation|digitalization|training|infrastructure|null",
    "keywords": ["keyword1", "keyword2"],
    "geographic_preferences": ["EU", "IT", "regione specifica"]
}

Se un campo non è deducibile dal testo, usa null o lista vuota.`;

async function analyzePrompt(userPrompt: string) {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  let raw = (message.content[0] as { type: "text"; text: string }).text.trim();
  if (raw.includes("```")) {
    raw = raw.split("```")[1];
    if (raw.startsWith("json")) raw = raw.slice(4);
    raw = raw.trim();
  }
  return JSON.parse(raw);
}

async function searchFunding(params: any) {
  // Build text search conditions from keywords
  const keywords = params.keywords || [];
  if (params.sector) keywords.push(params.sector);
  if (params.application_sector) keywords.push(params.application_sector);

  // Query all open funding calls
  let query = supabase
    .from("funding_calls")
    .select("*")
    .eq("status", "open")
    .order("deadline", { ascending: true, nullsFirst: false });

  const { data: allCalls, error } = await query;
  if (error) throw error;
  if (!allCalls) return [];

  // Score each result
  const scored = allCalls.map((call: any) => {
    let score = 0.1; // base score

    // Keyword match in title + description + sector_tags
    const searchText = `${call.title} ${call.description || ""} ${(call.sector_tags || []).join(" ")}`.toLowerCase();
    const matchedKeywords = keywords.filter((kw: string) => searchText.includes(kw.toLowerCase()));
    score += Math.min(matchedKeywords.length * 0.15, 0.5);

    // Geographic match
    if (params.location && (call.geographic_scope || []).some((g: string) =>
      g.toLowerCase() === params.location.toLowerCase() ||
      g.toLowerCase() === "eu" ||
      g.toLowerCase() === "it"
    )) {
      score += 0.15;
    }

    // Company size match
    if (params.company_type && (call.company_size || []).includes(params.company_type)) {
      score += 0.1;
    }

    // Funding type match
    if (params.funding_type && call.funding_type === params.funding_type) {
      score += 0.1;
    }

    // Geographic preference bonus
    const geoPrefs = params.geographic_preferences || [];
    if (geoPrefs.length > 0 && (call.geographic_scope || []).some((g: string) =>
      geoPrefs.some((p: string) => g.toLowerCase().includes(p.toLowerCase()))
    )) {
      score += 0.05;
    }

    return { ...call, relevance_score: Math.min(score, 1.0) };
  });

  // Sort by score and return top 20
  scored.sort((a: any, b: any) => b.relevance_score - a.relevance_score);
  return scored.slice(0, 20);
}

async function explainRelevance(title: string, description: string, userPrompt: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 150,
    system: "Spiega in 1-2 frasi in italiano perché questo bando è rilevante per l'utente. Sii specifico e conciso.",
    messages: [{
      role: "user",
      content: `Bando: ${title}\nDescrizione: ${(description || "").slice(0, 500)}\n\nRichiesta utente: ${userPrompt}`,
    }],
  });
  return (message.content[0] as { type: "text"; text: string }).text.trim();
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt richiesto" }, { status: 400 });
    }

    // 1. Analyze prompt with Claude
    const params = await analyzePrompt(prompt);

    // 2. Search funding calls
    const results = await searchFunding(params);

    // 3. Add AI explanation for top 5
    const enriched = await Promise.all(
      results.map(async (r: any, i: number) => ({
        ...r,
        relevance_score: Math.round(r.relevance_score * 1000) / 1000,
        why_relevant: i < 5 ? await explainRelevance(r.title, r.description, prompt) : null,
      }))
    );

    return NextResponse.json({
      extracted_params: params,
      results: enriched,
      total_results: enriched.length,
    });
  } catch (e: any) {
    console.error("Search error:", e);
    return NextResponse.json({ error: e.message || "Errore interno" }, { status: 500 });
  }
}
