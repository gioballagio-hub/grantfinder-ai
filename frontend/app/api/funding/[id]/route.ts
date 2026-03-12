import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  context: any
) {
  const id = context.params.id;

  const { data, error } = await supabase
    .from("funding_calls")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Funding fetch error:", error, "id:", id);
    return NextResponse.json({ error: "Bando non trovato" }, { status: 404 });
  }

  return NextResponse.json({ ...data, relevance_score: 0, why_relevant: null });
}
