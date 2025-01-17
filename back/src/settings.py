from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    openai_api_key: str = Field(..., env="OPENAI_API_KEY")
    openai_model: str = Field(..., env="OPENAI_MODEL")
    openai_embedding_model: str = Field(..., env="OPENAI_EMBEDDING_MODEL")

    aws_username: str = Field(..., env="AWS_USERNAME")
    aws_password: str = Field(..., env="AWS_PASSWORD")
    aws_console_site: str = Field(..., env="AWS_CONSOLE_SITE")

    aws_access_key_id: str = Field(..., env="AWS_ACCESS_KEY_ID")
    aws_secret_access_key: str = Field(..., env="AWS_SECRET_ACCESS_KEY")

    azure_ai_search_endpoint: str = Field(..., env="AZURE_AI_SEARCH_ENDPOINT")
    azure_ai_search_api_key: str = Field(..., env="AZURE_AI_SEARCH_API_KEY")
    azure_ai_search_index_name: str = Field(..., env="AZURE_AI_SEARCH_INDEX_NAME")

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
