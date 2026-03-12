"""Seed script: carica 34 fonti dati + 50 bandi mock nel database."""
import json
import os
import sys
from pathlib import Path

import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from api.db.models import Base, DataSource, FundingCall

DATABASE_URL = os.getenv(
    "DATABASE_URL_SYNC",
    "postgresql://postgres:postgres@localhost:5432/grantfinder",
)

engine = create_engine(DATABASE_URL)


def seed_sources():
    """Importa le 34 fonti dal file Excel bandi_sources.xlsx."""
    xlsx_path = Path(__file__).resolve().parent.parent.parent / "bandi_sources.xlsx"
    if not xlsx_path.exists():
        print(f"File non trovato: {xlsx_path}")
        return

    category_map = {
        "Fonti_Europee": "eu",
        "Fonti_Nazionali": "national",
        "Fonti_Regional_Local": "regional",
        "Aggregatori_Privati": "private",
    }

    integ_map = {"Alta": "alta", "Media": "media", "Bassa": "bassa", "Bassa/Media": "media"}

    sources = []
    xls = pd.ExcelFile(xlsx_path)
    for sheet_name in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name=sheet_name)
        category = category_map.get(sheet_name, "other")

        for _, row in df.iterrows():
            name = str(row.iloc[0])  # prima colonna = nome
            integ_raw = str(row.get("Integrabilità", row.get("Integrabilita'", ""))).strip()
            integ = integ_map.get(integ_raw, "bassa")

            # Determina tipo accesso
            access_info = str(row.get("Accesso", row.get("Formati e accesso", ""))).lower()
            if "api" in access_info:
                access_type = "api"
            elif "csv" in access_info or "download" in access_info or "ckan" in access_info:
                access_type = "csv"
            elif "web" in access_info or "html" in access_info:
                access_type = "scraping"
            else:
                access_type = "manual"

            # Formati
            formats_raw = str(row.get("Formati", row.get("Formati e accesso", "")))
            formats = [f.strip() for f in formats_raw.replace(",", " ").split() if len(f.strip()) <= 10 and f.strip().isupper()]
            if not formats:
                formats = ["HTML"]

            url_col = row.get("Evidenze/URL", "")
            note_col = row.get("Note", "")

            sources.append(DataSource(
                name=name,
                category=category,
                url=str(url_col) if pd.notna(url_col) and str(url_col).startswith("http") else None,
                access_type=access_type,
                formats=formats if formats else None,
                update_frequency=str(row.get("Aggiornamento", "")) if pd.notna(row.get("Aggiornamento")) else None,
                integrability=integ,
                enabled=integ == "alta",
                config={"note": str(note_col)} if pd.notna(note_col) and str(note_col) != "nan" else None,
            ))

    with Session(engine) as session:
        session.execute(text("DELETE FROM data_sources"))
        session.add_all(sources)
        session.commit()
        print(f"Caricate {len(sources)} fonti dati")


def seed_funding():
    """Carica i 50 bandi mock dal file JSON."""
    json_path = Path(__file__).resolve().parent / "mock_funding.json"
    with open(json_path) as f:
        calls = json.load(f)

    records = []
    for c in calls:
        records.append(FundingCall(
            title=c["title"],
            program=c.get("program"),
            organization=c.get("organization"),
            source=c["source"],
            url=c.get("url"),
            description=c.get("description"),
            objectives=c.get("objectives"),
            sector_tags=c.get("sector_tags"),
            company_size=c.get("company_size"),
            geographic_scope=c.get("geographic_scope"),
            funding_type=c.get("funding_type"),
            project_type=c.get("project_type"),
            min_grant=c.get("min_grant"),
            max_grant=c.get("max_grant"),
            funding_percentage=c.get("funding_percentage"),
            total_budget=c.get("total_budget"),
            opening_date=c.get("opening_date"),
            deadline=c.get("deadline"),
            eligibility_text=c.get("eligibility_text"),
            status=c.get("status", "open"),
        ))

    with Session(engine) as session:
        session.execute(text("DELETE FROM funding_calls"))
        session.add_all(records)
        session.commit()
        print(f"Caricati {len(records)} bandi mock")


if __name__ == "__main__":
    # Crea tabelle
    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    Base.metadata.create_all(engine)
    print("Tabelle create")

    seed_sources()
    seed_funding()
    print("Seed completato!")
