import voyageai
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..models.search import ExtractedParams

voyage_client: voyageai.AsyncClient | None = None


def get_voyage_client() -> voyageai.AsyncClient:
    global voyage_client
    if voyage_client is None:
        voyage_client = voyageai.AsyncClient(api_key=settings.voyage_api_key)
    return voyage_client


async def compute_embedding(text_input: str) -> list[float]:
    client = get_voyage_client()
    result = await client.embed([text_input], model=settings.embedding_model)
    return result.embeddings[0]


async def search_funding(
    db: AsyncSession,
    user_prompt: str,
    params: ExtractedParams,
    limit: int = 20,
) -> list[dict]:
    embedding = await compute_embedding(user_prompt)
    embedding_str = "[" + ",".join(str(x) for x in embedding) + "]"

    # Query: semantic similarity + filtri hard
    query = text("""
        WITH semantic AS (
            SELECT
                id, title, program, organization, source, url,
                description, sector_tags, company_size, geographic_scope,
                funding_type, project_type, min_grant, max_grant,
                funding_percentage, total_budget, opening_date, deadline,
                eligibility_text, status,
                1 - (embedding <=> :embedding::vector) AS similarity
            FROM funding_calls
            WHERE status = 'open'
              AND (deadline IS NULL OR deadline >= CURRENT_DATE)
            ORDER BY embedding <=> :embedding::vector
            LIMIT :limit
        )
        SELECT *,
            -- Score composito: 60% semantic + 40% rule-based bonus
            similarity * 0.6 +
            CASE WHEN :location = ANY(geographic_scope) THEN 0.1 ELSE 0 END +
            CASE WHEN :company_type = ANY(company_size) THEN 0.1 ELSE 0 END +
            CASE WHEN :funding_type = funding_type THEN 0.1 ELSE 0 END +
            CASE WHEN sector_tags && :keywords::text[] THEN 0.1 ELSE 0 END
            AS relevance_score
        FROM semantic
        ORDER BY relevance_score DESC
    """)

    result = await db.execute(
        query,
        {
            "embedding": embedding_str,
            "limit": limit,
            "location": params.location or "",
            "company_type": params.company_type or "",
            "funding_type": params.funding_type or "",
            "keywords": params.keywords or [],
        },
    )

    rows = result.mappings().all()
    return [dict(row) for row in rows]
