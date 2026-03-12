from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.database import get_db
from ..models.search import SearchRequest, SearchResponse
from ..services.matching_engine import enrich_results
from ..services.prompt_analyzer import analyze_prompt
from ..services.semantic_search import search_funding

router = APIRouter()


@router.post("/search", response_model=SearchResponse)
async def search(request: SearchRequest, db: AsyncSession = Depends(get_db)):
    # 1. Analizza prompt con Claude
    params = await analyze_prompt(request.prompt)

    # 2. Ricerca semantica con Voyage AI + pgvector
    raw_results = await search_funding(db, request.prompt, params)

    # 3. Arricchisci con spiegazione AI (top 5)
    enriched = await enrich_results(raw_results, request.prompt, params)

    return SearchResponse(
        extracted_params=params,
        results=enriched,
        total_results=len(enriched),
    )
