import base64
from typing import Any, Generator, Literal

from openai import OpenAI

from src.prompts.image_prompt import DESCRIPT_IMAGE_PROMPT, OCR_IMAGE_PROMPT
from src.settings import settings

client = OpenAI(api_key=settings.openai_api_key)


def local_image_to_data(image_path: str) -> str:
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def create_message(
    b64_image_data: bytes,
    mediatype: Literal["jpeg", "png"],
    mode: Literal["descript", "ocr"],
) -> str:
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
                        "url": f"data:image/{mediatype};base64,{b64_image_data}"
                    },
                },
            ],
        },
    ]
    return messages


def openai_image_call(messages: list[dict[str, Any]]) -> Generator[str, None, None]:
    response = client.chat.completions.create(
        model=settings.openai_model,
        messages=messages,
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


if __name__ == "__main__":
    image_path = "data/kakudai.png"
    b64_image_data = local_image_to_data(image_path)
    messages = create_message(b64_image_data, "png", "ocr")
    openai_image_call(messages)
