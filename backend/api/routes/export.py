from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.database import get_db
from ..models.search import SearchRequest
from ..services.matching_engine import enrich_results
from ..services.prompt_analyzer import analyze_prompt
from ..services.report_generator import generate_excel, generate_pdf
from ..services.semantic_search import search_funding

router = APIRouter()


@router.post("/export/pdf")
async def export_pdf(request: SearchRequest, db: AsyncSession = Depends(get_db)):
    params = await analyze_prompt(request.prompt)
    raw_results = await search_funding(db, request.prompt, params)
    enriched = await enrich_results(raw_results, request.prompt, params)

    pdf_bytes = generate_pdf(enriched, request.prompt)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=grantfinder_report.pdf"},
    )


@router.post("/export/excel")
async def export_excel(request: SearchRequest, db: AsyncSession = Depends(get_db)):
    params = await analyze_prompt(request.prompt)
    raw_results = await search_funding(db, request.prompt, params)
    enriched = await enrich_results(raw_results, request.prompt, params)

    xlsx_bytes = generate_excel(enriched, request.prompt)
    return Response(
        content=xlsx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=grantfinder_report.xlsx"},
    )
