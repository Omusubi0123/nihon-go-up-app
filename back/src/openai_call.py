from typing import Generator

from openai import OpenAI

from src.settings import Settings


def openai_call(messages: list[dict]) -> Generator[str, None, None]:
    settings = Settings()

    client = OpenAI(api_key=settings.openai_api_key)

    response = client.chat.completions.create(
        model=settings.openai_model,
        messages=messages,
        temperature=0.7,
        max_tokens=2000,
        top_p=0.95,
        frequency_penalty=0,
        presence_penalty=0,
        stop=None,
        stream=True,
        timeout=100,
    )

    for chunk in response:
        content = chunk.choices[0].delta.content
        if type(content) == str:
            yield content
