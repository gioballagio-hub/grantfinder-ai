from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.database import get_db
from ..db.models import DataSource, FundingCall
from ..models.funding import DataSourceOut, FundingCallOut

router = APIRouter()


@router.get("/funding/{funding_id}", response_model=FundingCallOut)
async def get_funding(funding_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FundingCall).where(FundingCall.id == funding_id))
    funding = result.scalar_one_or_none()
    if not funding:
        raise HTTPException(status_code=404, detail="Bando non trovato")
    return funding


@router.get("/funding", response_model=list[FundingCallOut])
async def list_funding(
    status: str = "open",
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(FundingCall)
        .where(FundingCall.status == status)
        .order_by(FundingCall.deadline.asc().nullslast())
        .limit(limit)
        .offset(offset)
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/sources", response_model=list[DataSourceOut])
async def list_sources(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DataSource).order_by(DataSource.category, DataSource.name))
    return result.scalars().all()
