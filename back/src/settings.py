from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    openai_api_key: str = Field(..., alias="OPENAI_API_KEY")
    openai_model: str = Field(..., alias="OPENAI_MODEL")
    openai_embedding_model: str = Field(..., alias="OPENAI_EMBEDDING_MODEL")

    azure_ai_search_endpoint: str = Field(..., alias="AZURE_AI_SEARCH_ENDPOINT")
    azure_ai_search_api_key: str = Field(..., alias="AZURE_AI_SEARCH_API_KEY")

    model_config = SettingsConfigDict(env_file=".env")


def get_settings():
    return Settings()


settings = get_settings()
