import anthropic

from ..config import settings
from ..models.funding import FundingSearchResult
from ..models.search import ExtractedParams


async def explain_relevance(
    funding_title: str,
    funding_description: str,
    user_prompt: str,
) -> str:
    """Genera una breve spiegazione del perche' il bando e' rilevante."""
    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    message = await client.messages.create(
        model=settings.claude_model,
        max_tokens=150,
        system="Spiega in 1-2 frasi in italiano perche' questo bando e' rilevante per l'utente. Sii specifico e conciso.",
        messages=[
            {
                "role": "user",
                "content": f"Bando: {funding_title}\nDescrizione: {funding_description[:500]}\n\nRichiesta utente: {user_prompt}",
            }
        ],
    )
    return message.content[0].text.strip()


async def enrich_results(
    results: list[dict],
    user_prompt: str,
    params: ExtractedParams,
    top_n: int = 10,
) -> list[FundingSearchResult]:
    """Arricchisce i top risultati con spiegazione AI."""
    enriched = []
    for i, row in enumerate(results[:top_n]):
        why = None
        if i < 5:  # Spiegazione AI solo per i top 5
            why = await explain_relevance(
                row["title"],
                row.get("description") or "",
                user_prompt,
            )
        enriched.append(
            FundingSearchResult(
                **{k: v for k, v in row.items() if k not in ("similarity", "relevance_score", "embedding")},
                relevance_score=round(float(row.get("relevance_score", 0)), 3),
                why_relevant=why,
            )
        )
    return enriched
