import base64
from typing import Any, Generator, Literal

from openai import OpenAI

from src.prompts.image_prompt import (
    COMPARE_IMAGE_DESCRIPTION_PROMPT,
    DESCRIPT_IMAGE_PROMPT,
    OCR_IMAGE_PROMPT,
)
from src.settings import settings

client = OpenAI(api_key=settings.openai_api_key)


def local_image_to_data(image_path: str) -> str:
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def create_messages(
    b64_image_data: bytes,
    mediatype: Literal["jpeg", "png"],
    mode: Literal["descript", "ocr"],
) -> list[dict[str, Any]]:
    if mode == "descript":
        prompt = DESCRIPT_IMAGE_PROMPT
    elif mode == "ocr":
        prompt = OCR_IMAGE_PROMPT
    else:
        raise ValueError("mode must be 'descript' or 'ocr'")
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": prompt,
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/{mediatype};base64,{b64_image_data}"  # type: ignore
                    },
                },
            ],
        },
    ]
    return messages


def create_compare_messages(
    b64_image_data: bytes,
    mediatype: Literal["jpeg", "png"],
    llm_description: str,
    user_description: str,
) -> list[dict[str, Any]]:
    prompt = COMPARE_IMAGE_DESCRIPTION_PROMPT.format(
        llm_description=llm_description,
        user_description=user_description,
    )

    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": prompt,
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/{mediatype};base64,{b64_image_data}"  # type: ignore
                    },
                },
            ],
        },
    ]
    return messages


def openai_image_call(messages: list[dict[str, Any]]) -> Generator[str, None, None]:
    response = client.chat.completions.create(
        model=settings.openai_model,
        messages=messages,  # type: ignore
        max_tokens=2000,
        top_p=0.95,
        frequency_penalty=0,
        presence_penalty=0,
        stream=True,
        timeout=100,
    )

    for chunk in response:
        content = chunk.choices[0].delta.content  # type: ignore
        if type(content) == str:
            yield content


if __name__ == "__main__":
    image_path = "data/dog_use/1.jpeg"
    b64_image_data = local_image_to_data(image_path)
    messages = create_messages(b64_image_data, "jpeg", "descript")  # type: ignore
    openai_image_call(messages)
