from typing import Any, Generator, Literal

from openai import OpenAI

from src.settings import settings

client = OpenAI(api_key=settings.openai_api_key)


from src.prompts.vocabulary_prompt import (
    HURIGANA_PROMPT,
    TERM_AND_MEAN_PROMPT,
    TO_EASY_VOCABULARY_PROMPT,
    TO_HARD_VOCABULARY_PROMPT,
)


def create_convert_messages(raw_text: str, mode: Literal["easy", "hard"]):
    if mode == "easy":
        prompt = TO_EASY_VOCABULARY_PROMPT.format(difficult_text=raw_text)
    elif mode == "hard":
        prompt = TO_HARD_VOCABULARY_PROMPT.format(easy_text=raw_text)
    else:
        raise ValueError("mode must be 'easy' or 'hard'")
    messages = [
        {
            "role": "system",
            "content": "あなたは文章をより語彙の難しい文章や易しい文書に変換することが世界で一番得です。",
        },
        {
            "role": "user",
            "content": prompt,
        },
    ]
    return messages


def create_messages(raw_text: str, mode: Literal["hurigana", "term_and_mean"]):
    if mode == "hurigana":
        prompt = HURIGANA_PROMPT.format(raw_text=raw_text)
    elif mode == "term_and_mean":
        prompt = TERM_AND_MEAN_PROMPT.format(raw_text=raw_text)
    else:
        raise ValueError("mode must be 'hurigana' or 'term_and_mean'")

    messages = [
        {
            "role": "system",
            "content": "あなたは世界で一番漢字の意味・読み方に精通している能力者です。",
        },
        {
            "role": "user",
            "content": prompt,
        },
    ]
    return messages


def openai_call(messages: list[dict[str, Any]]) -> Generator[str, None, None]:
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
