from pydantic import BaseModel


class SearchRequest(BaseModel):
    prompt: str


class ExtractedParams(BaseModel):
    company_type: str | None = None
    sector: str | None = None
    application_sector: str | None = None
    location: str | None = None
    funding_type: str | None = None
    project_type: str | None = None
    keywords: list[str] = []
    geographic_preferences: list[str] = []


class SearchResponse(BaseModel):
    extracted_params: ExtractedParams
    results: list = []
    total_results: int = 0
