import uuid
from datetime import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import DeclarativeBase

from ..config import settings


class Base(DeclarativeBase):
    pass


class FundingCall(Base):
    __tablename__ = "funding_calls"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(Text, nullable=False)
    program = Column(Text)
    organization = Column(Text)
    source = Column(Text, nullable=False)
    source_id = Column(Text)
    url = Column(Text)

    description = Column(Text)
    objectives = Column(Text)
    eligible_activities = Column(Text)

    sector_tags = Column(ARRAY(String))
    company_size = Column(ARRAY(String))
    geographic_scope = Column(ARRAY(String))
    funding_type = Column(String)
    project_type = Column(ARRAY(String))

    min_grant = Column(Numeric)
    max_grant = Column(Numeric)
    funding_percentage = Column(Numeric)
    total_budget = Column(Numeric)

    opening_date = Column(Date)
    deadline = Column(Date)

    eligibility_text = Column(Text)

    embedding = Column(Vector(settings.embedding_dim))

    status = Column(String, default="open")
    language = Column(String, default="it")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    raw_data = Column(JSONB)


class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False)
    category = Column(Text, nullable=False)
    url = Column(Text)
    access_type = Column(Text)
    formats = Column(ARRAY(String))
    update_frequency = Column(Text)
    integrability = Column(Text)
    enabled = Column(Boolean, default=False)
    last_sync = Column(DateTime(timezone=True))
    config = Column(JSONB)


class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_prompt = Column(Text, nullable=False)
    extracted_params = Column(JSONB)
    results_count = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
