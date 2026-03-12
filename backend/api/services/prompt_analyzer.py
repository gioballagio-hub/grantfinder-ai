import json

import anthropic

from ..config import settings
from ..models.search import ExtractedParams

SYSTEM_PROMPT = """Sei un esperto di finanziamenti pubblici europei e italiani.
Analizza il prompt dell'utente ed estrai i parametri strutturati in formato JSON.

Rispondi SOLO con un JSON valido con questa struttura:
{
    "company_type": "micro|small|medium|large|startup|null",
    "sector": "settore principale dell'azienda",
    "application_sector": "settore di applicazione del progetto",
    "location": "localizzazione dell'azienda (regione/paese)",
    "funding_type": "grant|loan|tax_credit|mixed|null",
    "project_type": "R&D|innovation|digitalization|training|infrastructure|null",
    "keywords": ["keyword1", "keyword2"],
    "geographic_preferences": ["EU", "IT", "regione specifica"]
}

Se un campo non è deducibile dal testo, usa null o lista vuota."""


async def analyze_prompt(user_prompt: str) -> ExtractedParams:
    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    message = await client.messages.create(
        model=settings.claude_model,
        max_tokens=512,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )

    raw = message.content[0].text.strip()
    # Estrai JSON anche se wrapped in markdown code blocks
    if "```" in raw:
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    data = json.loads(raw)
    return ExtractedParams(**data)
