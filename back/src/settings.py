from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    openai_api_key: str = Field(..., env="OPENAI_API_KEY")
    openai_model: str = Field(..., env="OPENAI_MODEL")
    openai_embedding_model: str = Field(..., env="OPENAI_EMBEDDING_MODEL")

    azure_ai_search_endpoint: str = Field(..., env="AZURE_AI_SEARCH_ENDPOINT")
    azure_ai_search_api_key: str = Field(..., env="AZURE_AI_SEARCH_API_KEY")

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
