import base64
import json
from typing import Generator

import boto3

from src.prompts.description_prompt import DESCRIPT_IMAGE_PROMPT
from src.settings import Settings


def local_image_to_data(image_path: str) -> bytes:
    with open(image_path, "rb") as f:
        b64_image_data = base64.b64encode(f.read()).decode("utf-8")
    return b64_image_data


def create_body(b64_image_data: bytes) -> str:
    messages = [
        {"role": "user", "content": [{"type": "text", "text": DESCRIPT_IMAGE_PROMPT}]},
    ]
    if image_path:
        b64_image_data = local_image_to_data(image_path)
        messages[0]["content"].append(
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/jpeg",
                    "data": b64_image_data,
                },
            }
        )
    body = json.dumps(
        {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "temperature": 0.5,
            "messages": messages,
        }
    )
    return body


def descript_image(b64_image_data: bytes) -> Generator[str, None, None]:
    settings = Settings()
    session = boto3.Session(profile_name=settings.aws_username)
    client = session.client(service_name="bedrock-runtime", region_name="us-east-1")
    response = client.invoke_model_with_response_stream(
        modelId="anthropic.claude-3-5-sonnet-20240620-v1:0",
        body=create_body(b64_image_data),
    )
    stream = response.get("body")
    if stream:
        for event in stream:
            chunk = event.get("chunk")
            if chunk:
                data = json.loads(chunk.get("bytes").decode())
                content = data.get("content_block", {}).get("text") or data.get(
                    "delta", {}
                ).get("text")
                if content:
                    yield content


if __name__ == "__main__":
    import sys

    image_path = "data/landscape.png"
    b64_image_data = local_image_to_data(image_path)
    descript_image(b64_image_data)
