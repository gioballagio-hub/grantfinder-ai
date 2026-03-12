from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class FundingCallOut(BaseModel):
    id: UUID
    title: str
    program: str | None = None
    organization: str | None = None
    source: str
    url: str | None = None
    description: str | None = None
    sector_tags: list[str] | None = None
    company_size: list[str] | None = None
    geographic_scope: list[str] | None = None
    funding_type: str | None = None
    project_type: list[str] | None = None
    min_grant: Decimal | None = None
    max_grant: Decimal | None = None
    funding_percentage: Decimal | None = None
    total_budget: Decimal | None = None
    opening_date: date | None = None
    deadline: date | None = None
    eligibility_text: str | None = None
    status: str = "open"

    model_config = {"from_attributes": True}


class FundingSearchResult(FundingCallOut):
    relevance_score: float = 0.0
    why_relevant: str | None = None


class DataSourceOut(BaseModel):
    id: int
    name: str
    category: str
    url: str | None = None
    access_type: str | None = None
    integrability: str | None = None
    enabled: bool = False
    last_sync: datetime | None = None

    model_config = {"from_attributes": True}
