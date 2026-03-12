import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

const SYSTEM_PROMPT = `Sei un esperto di finanziamenti pubblici europei e italiani.
Analizza il prompt dell'utente ed estrai i parametri strutturati.

Rispondi SOLO con JSON valido, senza testo prima o dopo. Struttura:
{"company_type":"micro|small|medium|large|startup|null","sector":"settore","application_sector":"applicazione","location":"regione/paese","funding_type":"grant|loan|tax_credit|mixed|null","project_type":"R&D|innovation|digitalization|training|infrastructure|null","keywords":["kw1","kw2"],"geographic_preferences":["EU","IT"]}

Se un campo non è deducibile, usa null o [].`;

async function analyzePrompt(userPrompt: string) {
  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    let raw = (message.content[0] as { type: "text"; text: string }).text.trim();
    // Rimuovi code blocks se presenti
    if (raw.includes("```")) {
      raw = raw.split("```")[1];
      if (raw.startsWith("json")) raw = raw.slice(4);
      raw = raw.trim();
    }
    // Trova il JSON object nel testo
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      raw = raw.slice(start, end + 1);
    }
    return JSON.parse(raw);
  } catch (e: any) {
    console.error("Prompt analysis error:", e.message);
    // Fallback: estrai keywords dal prompt
    const words = userPrompt.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    return {
      company_type: null,
      sector: null,
      application_sector: null,
      location: null,
      funding_type: null,
      project_type: null,
      keywords: words.slice(0, 10),
      geographic_preferences: [],
    };
  }
}

function scoreFunding(allCalls: any[], params: any) {
  const keywords = [...(params.keywords || [])];
  if (params.sector) keywords.push(params.sector);
  if (params.application_sector) keywords.push(params.application_sector);

  const scored = allCalls.map((call: any) => {
    let score = 0.1;

    const searchText = `${call.title} ${call.description || ""} ${(call.sector_tags || []).join(" ")}`.toLowerCase();
    const matchedKeywords = keywords.filter((kw: string) => searchText.includes(kw.toLowerCase()));
    score += Math.min(matchedKeywords.length * 0.15, 0.5);

    if (params.location && (call.geographic_scope || []).some((g: string) =>
      g.toLowerCase() === params.location?.toLowerCase() ||
      g.toLowerCase() === "eu" ||
      g.toLowerCase() === "it"
    )) {
      score += 0.15;
    }

    if (params.company_type && (call.company_size || []).includes(params.company_type)) {
      score += 0.1;
    }

    if (params.funding_type && call.funding_type === params.funding_type) {
      score += 0.1;
    }

    const geoPrefs = params.geographic_preferences || [];
    if (geoPrefs.length > 0 && (call.geographic_scope || []).some((g: string) =>
      geoPrefs.some((p: string) => g.toLowerCase().includes(p.toLowerCase()))
    )) {
      score += 0.05;
    }

    return { ...call, relevance_score: Math.min(score, 1.0) };
  });

  scored.sort((a: any, b: any) => b.relevance_score - a.relevance_score);
  return scored.slice(0, 20);
}

async function explainRelevance(title: string, description: string, userPrompt: string): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      system: "Spiega in 1-2 frasi in italiano perché questo bando è rilevante per l'utente. Sii conciso.",
      messages: [{
        role: "user",
        content: `Bando: ${title}\nDescrizione: ${(description || "").slice(0, 300)}\n\nUtente: ${userPrompt.slice(0, 300)}`,
      }],
    });
    return (message.content[0] as { type: "text"; text: string }).text.trim();
  } catch {
    return "";
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt richiesto" }, { status: 400 });
    }

    // 1. Analyze prompt with Claude
    const params = await analyzePrompt(prompt);

    // 2. Fetch all open funding calls from Supabase
    const { data: allCalls, error } = await supabase
      .from("funding_calls")
      .select("*")
      .eq("status", "open")
      .order("deadline", { ascending: true, nullsFirst: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Errore database" }, { status: 500 });
    }

    // 3. Score and rank
    const results = scoreFunding(allCalls || [], params);

    // 4. Add AI explanation for top 3 only (faster)
    const enriched = [];
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      enriched.push({
        ...r,
        relevance_score: Math.round(r.relevance_score * 1000) / 1000,
        why_relevant: i < 3 ? await explainRelevance(r.title, r.description, prompt) : null,
      });
    }

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
