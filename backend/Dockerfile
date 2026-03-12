FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Seed DB on startup, then run server
CMD python seed/seed_db.py && uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
