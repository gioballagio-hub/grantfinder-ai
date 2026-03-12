from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..models.search import ExtractedParams

try:
    import voyageai
    VOYAGE_AVAILABLE = True
except ImportError:
    VOYAGE_AVAILABLE = False

voyage_client = None


def get_voyage_client():
    global voyage_client
    if voyage_client is None and VOYAGE_AVAILABLE and settings.voyage_api_key:
        voyage_client = voyageai.AsyncClient(api_key=settings.voyage_api_key)
    return voyage_client


async def compute_embedding(text_input: str) -> list[float] | None:
    client = get_voyage_client()
    if not client:
        return None
    result = await client.embed([text_input], model=settings.embedding_model)
    return result.embeddings[0]


async def search_funding(
    db: AsyncSession,
    user_prompt: str,
    params: ExtractedParams,
    limit: int = 20,
) -> list[dict]:
    embedding = await compute_embedding(user_prompt)

    if embedding:
        return await _semantic_search(db, embedding, params, limit)
    else:
        return await _text_search(db, user_prompt, params, limit)


async def _semantic_search(
    db: AsyncSession,
    embedding: list[float],
    params: ExtractedParams,
    limit: int,
) -> list[dict]:
    embedding_str = "[" + ",".join(str(x) for x in embedding) + "]"

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
    return [dict(row) for row in result.mappings().all()]


async def _text_search(
    db: AsyncSession,
    user_prompt: str,
    params: ExtractedParams,
    limit: int,
) -> list[dict]:
    """Fallback: keyword matching + rule-based scoring quando embeddings non disponibili."""
    # Costruisci termini di ricerca dai keywords + prompt
    search_terms = params.keywords or []
    if params.sector:
        search_terms.append(params.sector)
    if params.application_sector:
        search_terms.append(params.application_sector)

    # Crea pattern ILIKE
    like_conditions = " OR ".join(
        f"(LOWER(title || ' ' || COALESCE(description,'') || ' ' || COALESCE(array_to_string(sector_tags,','),'')) LIKE '%' || LOWER(:kw{i}) || '%')"
        for i in range(len(search_terms))
    )

    if not like_conditions:
        like_conditions = "TRUE"

    query_str = f"""
        SELECT
            id, title, program, organization, source, url,
            description, sector_tags, company_size, geographic_scope,
            funding_type, project_type, min_grant, max_grant,
            funding_percentage, total_budget, opening_date, deadline,
            eligibility_text, status,
            (
                CASE WHEN ({like_conditions}) THEN 0.5 ELSE 0.1 END +
                CASE WHEN :location = ANY(geographic_scope) THEN 0.15 ELSE 0 END +
                CASE WHEN :company_type = ANY(company_size) THEN 0.15 ELSE 0 END +
                CASE WHEN :funding_type = funding_type THEN 0.1 ELSE 0 END +
                CASE WHEN sector_tags && :all_keywords::text[] THEN 0.1 ELSE 0 END
            ) AS relevance_score
        FROM funding_calls
        WHERE status = 'open'
          AND (deadline IS NULL OR deadline >= CURRENT_DATE)
        ORDER BY relevance_score DESC
        LIMIT :limit
    """

    bind_params = {
        "location": params.location or "",
        "company_type": params.company_type or "",
        "funding_type": params.funding_type or "",
        "all_keywords": search_terms,
        "limit": limit,
    }
    for i, kw in enumerate(search_terms):
        bind_params[f"kw{i}"] = kw

    result = await db.execute(text(query_str), bind_params)
    return [dict(row) for row in result.mappings().all()]
