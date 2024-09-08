from typing import Generator

from openai import AzureOpenAI

from src.settings import Settings


def aoai_call(messages: list[dict]) -> Generator[str, None, None]:
    settings = Settings()

    client = AzureOpenAI(
        api_key=settings.azure_openai_api_key,
        api_version=settings.azure_openai_version,
        base_url=f"{settings.azure_openai_endpoint}openai/deployments/{settings.azure_openai_model}",
    )

    response = client.chat.completions.create(
        model=settings.azure_openai_model,
        messages=messages,
        temperature=0,  # 出力のランダム度合い(可変)
        max_tokens=2000,  # 最大トークン数(固定)
        top_p=0.95,  # 予測する単語を上位何%からサンプリングするか(可変)
        frequency_penalty=0,  # 単語の繰り返しをどのくらい許容するか(可変)
        presence_penalty=0,  # 同じ単語をどのくらい使うか(可変)
        stop=None,  # 文章生成を停止する単語を指定する(可変)
        stream=True,
        timeout=100,
    )

    for chunk in response:
        content = chunk.choices[0].delta.content
        if type(content) == str:
            yield content
