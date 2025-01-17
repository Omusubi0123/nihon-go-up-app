import ast
import base64
import json
from glob import glob
from typing import Generator

from openai import OpenAI

from src.prompts.image_prompt import IMAGE_TO_TEXT_FOR_RAG_PROMPT
from src.settings import settings

client = OpenAI(api_key=settings.openai_api_key)


def local_image_to_data(image_path: str) -> bytes:
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def create_message(
    b64_image_data: bytes,
) -> str:
    messages = [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": IMAGE_TO_TEXT_FOR_RAG_PROMPT},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{b64_image_data}"},
                },
            ],
        },
    ]
    return messages


def llm_process_image(b64_image_data: bytes) -> dict[str, str]:
    response = client.chat.completions.create(
        model=settings.openai_model,
        messages=create_message(b64_image_data),
        max_tokens=2000,
        top_p=0.95,
        frequency_penalty=0,
        presence_penalty=0,
        stop=None,
        stream=True,
        timeout=100,
        response_format={"type": "json_object"},
    )

    response_text = ""
    for chunk in response:
        content = chunk.choices[0].delta.content
        if type(content) == str:
            print(content, end="", flush=True)
            response_text += content

    return ast.literal_eval(response_text)


def main(
    image_paths: str = glob("data/dog_use/*.jpeg"),
    save_path: str = "data/filesearch/dog_use.json",
):
    image_and_text = []
    for image_path in image_paths:
        print("\nprocessing image:", image_path)
        b64_image_data = local_image_to_data(image_path)
        response_json = llm_process_image(b64_image_data)

        image_and_text.append(
            {
                "title": response_json["title"],
                "content": response_json["detail"],
                "id": image_path.split("/")[-1].split(".")[0],
            }
        )
    with open(save_path, "w") as f:
        json.dump(image_and_text, f, indent=4, ensure_ascii=False)


if __name__ == "__main__":
    main()
