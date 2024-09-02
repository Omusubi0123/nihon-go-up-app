from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    cotomi_api_key: str = Field(..., env="COTOMI_API_KEY")
    cotomi_base_url: str = Field(..., env="COTOMI_BASE_URL")
    cotomi_model: str = Field(..., env="COTOMI_MODEL")

    aws_username: str = Field(..., env="AWS_USERNAME")
    aws_password: str = Field(..., env="AWS_PASSWORD")
    aws_console_site: str = Field(..., env="AWS_CONSOLE_SITE")

    aws_access_key_id: str = Field(..., env="AWS_ACCESS_KEY_ID")
    aws_secret_access_key: str = Field(..., env="AWS_SECRET_ACCESS_KEY")

    azure_openai_model: str = Field(..., env="AZURE_OPENAI_MODEL")
    azure_openai_endpoint: str = Field(..., env="AZURE_OPENAI_ENDPOINT")
    azure_openai_api_key: str = Field(..., env="AZURE_OPENAI_API_KEY")

    azure_ai_search_endpoint: str = Field(..., env="AZURE_AI_SEARCH_ENDPOINT")
    azure_ai_search_api_key: str = Field(..., env="AZURE_AI_SEARCH_API_KEY")

    model_config = SettingsConfigDict(env_file=".env")
