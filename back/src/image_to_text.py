import base64
import json
import sys
from typing import Generator

import boto3

from src.prompts.image_prompt import IMAGE_TO_TEXT_FOR_RAG_PROMPT
from src.settings import Settings


def local_image_to_data(image_path: str) -> bytes:
    with open(image_path, "rb") as f:
        b64_image_data = base64.b64encode(f.read()).decode("utf-8")
    return b64_image_data


def create_body(
    b64_image_data: bytes,
) -> str:
    messages = [
        {
            "role": "user",
            "content": [{"type": "text", "text": IMAGE_TO_TEXT_FOR_RAG_PROMPT}],
        },
    ]
    messages[0]["content"].append(
        {
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": f"image/jpeg",
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


def llm_process_image(
    b64_image_data: bytes,
) -> Generator[str, None, None]:
    settings = Settings()
    session = boto3.Session(profile_name=settings.aws_username)
    client = session.client(service_name="bedrock-runtime", region_name="us-east-1")
    response = client.invoke_model_with_response_stream(
        modelId="anthropic.claude-3-5-sonnet-20240620-v1:0",
        body=create_body(b64_image_data),
    )
    stream = response.get("body")
    combined_text = ""
    if stream:
        for event in stream:
            chunk = event.get("chunk")
            if chunk:
                data = json.loads(chunk.get("bytes").decode())
                content = data.get("content_block", {}).get("text") or data.get(
                    "delta", {}
                ).get("text")
                if content:
                    combined_text += content
                    print(content, end="")
                    sys.stdout.flush()
    return combined_text


def main():
    import ast
    import json
    from glob import glob

    image_paths = glob("data/dog_use/*.jpeg")

    image_and_text = []
    for image_path in image_paths:
        while True:
            try:
                print("\nprocessing image:", image_path)
                b64_image_data = local_image_to_data(image_path)
                response = llm_process_image(b64_image_data)
                response_json = ast.literal_eval(response)

                image_and_text.append(
                    {
                        "title": response_json["title"],
                        "content": response_json["detail"],
                        "id": image_path.split("/")[-1].split(".")[0],
                    }
                )
                break
            except Exception as e:
                print(e)
    with open("data/filesearch/dog_use_100.json", "w") as f:
        json.dump(image_and_text, f, indent=4, ensure_ascii=False)


if __name__ == "__main__":
    main()
