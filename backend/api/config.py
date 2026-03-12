from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/grantfinder"
    database_url_sync: str = "postgresql://postgres:postgres@localhost:5432/grantfinder"

    anthropic_api_key: str = ""
    voyage_api_key: str = ""

    embedding_model: str = "voyage-3-lite"
    embedding_dim: int = 1024

    claude_model: str = "claude-haiku-4-5-20251001"

    cors_origins: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"


settings = Settings()
