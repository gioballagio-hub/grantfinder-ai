import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

const SYSTEM_PROMPT = `Sei un esperto di finanziamenti pubblici europei e italiani.
Analizza il prompt dell'utente ed estrai i parametri strutturati.

Rispondi SOLO con JSON valido, senza testo prima o dopo. Struttura:
{"company_type":"micro|small|medium|large|startup|null","sector":"settore","application_sector":"applicazione","location":"regione/paese","funding_type":"grant|loan|tax_credit|mixed|null","project_type":"R&D|innovation|digitalization|training|infrastructure|null","keywords":["kw1","kw2"],"geographic_preferences":["EU","IT"],"prefers_fondo_perduto":true}

Se un campo non è deducibile, usa null o [].
prefers_fondo_perduto=true se l'utente chiede contributi a fondo perduto o grants.`;

async function analyzePrompt(userPrompt: string) {
  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    let raw = (message.content[0] as { type: "text"; text: string }).text.trim();
    if (raw.includes("```")) {
      raw = raw.split("```")[1];
      if (raw.startsWith("json")) raw = raw.slice(4);
      raw = raw.trim();
    }
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      raw = raw.slice(start, end + 1);
    }
    return JSON.parse(raw);
  } catch (e: any) {
    console.error("Prompt analysis error:", e.message);
    const words = userPrompt.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    return {
      company_type: null, sector: null, application_sector: null,
      location: null, funding_type: null, project_type: null,
      keywords: words.slice(0, 10), geographic_preferences: [],
      prefers_fondo_perduto: userPrompt.toLowerCase().includes("fondo perduto"),
    };
  }
}

// Mappa source → categoria
function getCategory(source: string, geo: string[]): string {
  if (source === "eu_funding_tenders" || (geo || []).some(g => g === "EU")) return "eu";
  if (source === "regional" || (geo || []).some(g =>
    !["EU", "IT"].includes(g) && g.length > 2
  )) return "regional";
  return "national";
}

function scoreFunding(allCalls: any[], params: any) {
  const keywords = [...(params.keywords || [])];
  if (params.sector) keywords.push(params.sector);
  if (params.application_sector) keywords.push(params.application_sector);

  const scored = allCalls.map((call: any) => {
    let score = 0;

    // 1. KEYWORD MATCHING (0-35 punti)
    const searchText = `${call.title} ${call.description || ""} ${(call.sector_tags || []).join(" ")} ${call.objectives || ""}`.toLowerCase();
    const matchedKeywords = keywords.filter((kw: string) => searchText.includes(kw.toLowerCase()));
    const keywordScore = keywords.length > 0
      ? (matchedKeywords.length / keywords.length) * 35
      : 5;
    score += keywordScore;

    // 2. GEOGRAPHIC MATCH (0-20 punti)
    const geoPrefs = params.geographic_preferences || [];
    const userLocation = params.location?.toLowerCase() || "";
    const callGeo = (call.geographic_scope || []).map((g: string) => g.toLowerCase());

    if (userLocation && callGeo.includes(userLocation)) {
      score += 20; // match esatto regione
    } else if (userLocation && callGeo.includes("it")) {
      score += 15; // match nazionale
    } else if (callGeo.includes("eu")) {
      score += 10; // match EU
    }
    // Bonus per preferenze geografiche
    if (geoPrefs.some((p: string) => callGeo.includes(p.toLowerCase()))) {
      score += 5;
    }

    // 3. COMPANY SIZE MATCH (0-15 punti)
    if (params.company_type && (call.company_size || []).includes(params.company_type)) {
      score += 15;
    } else if (!params.company_type) {
      score += 5; // non penalizzare se non specificato
    }

    // 4. FUNDING TYPE MATCH (0-15 punti)
    if (params.funding_type && call.funding_type === params.funding_type) {
      score += 15;
    }
    // Bonus forte per fondo perduto se richiesto
    if (params.prefers_fondo_perduto && call.funding_type === "grant") {
      score += 10;
    }

    // 5. PROJECT TYPE MATCH (0-10 punti)
    if (params.project_type && (call.project_type || []).includes(params.project_type)) {
      score += 10;
    }

    // 6. DEADLINE BONUS (0-5 punti) - bandi con scadenza più lontana = più tempo
    if (call.deadline) {
      const daysLeft = (new Date(call.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysLeft > 180) score += 5;
      else if (daysLeft > 90) score += 3;
      else if (daysLeft > 30) score += 1;
    }

    // Normalizza a 0-1
    const maxScore = 110;
    const normalizedScore = Math.min(score / maxScore, 1.0);

    // Calcola importo fondo perduto effettivo
    let grantAmount = 0;
    if (call.max_grant) {
      if (call.funding_type === "grant") {
        grantAmount = Number(call.max_grant);
      } else if (call.funding_type === "mixed" && call.funding_percentage) {
        grantAmount = Number(call.max_grant) * (Number(call.funding_percentage) / 100);
      } else if (call.funding_type === "tax_credit" && call.funding_percentage) {
        grantAmount = Number(call.max_grant) * (Number(call.funding_percentage) / 100);
      }
    }

    return {
      ...call,
      relevance_score: Math.round(normalizedScore * 1000) / 1000,
      grant_amount: grantAmount,
      category: getCategory(call.source, call.geographic_scope),
    };
  });

  // Ordinamento primario: score, secondario: grant_amount
  scored.sort((a: any, b: any) => {
    if (Math.abs(b.relevance_score - a.relevance_score) > 0.05) {
      return b.relevance_score - a.relevance_score;
    }
    return b.grant_amount - a.grant_amount;
  });

  return scored;
}

async function explainRelevance(title: string, description: string, userPrompt: string): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      system: "Spiega in 1-2 frasi in italiano perché questo bando è rilevante per l'utente. Sii conciso e specifico.",
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

    const params = await analyzePrompt(prompt);

    const { data: allCalls, error } = await supabase
      .from("funding_calls")
      .select("*")
      .eq("status", "open")
      .order("deadline", { ascending: true, nullsFirst: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Errore database" }, { status: 500 });
    }

    const results = scoreFunding(allCalls || [], params);

    // AI explanation per i top 5
    const enriched = [];
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      enriched.push({
        ...r,
        why_relevant: i < 5 ? await explainRelevance(r.title, r.description, prompt) : null,
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
