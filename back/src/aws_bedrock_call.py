import base64
import json
import sys

import boto3


def local_image_to_data(image_path: str) -> str:
    with open(image_path, "rb") as f:
        b64_image_data = base64.b64encode(f.read()).decode("utf-8")
    return b64_image_data


def create_body(prompt: str, image_path: str | None = None) -> str:
    messages = [
        {"role": "user", "content": [{"type": "text", "text": prompt}]},
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


def aws_bedrock_call(prompt: str, image_path: str | None = None):
    session = boto3.Session(profile_name="llm-user009")
    client = session.client(service_name="bedrock-runtime", region_name="us-east-1")

    response = client.invoke_model_with_response_stream(
        modelId="anthropic.claude-3-5-sonnet-20240620-v1:0",
        body=create_body(prompt, image_path),
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
                    print(content, end="")
                    sys.stdout.flush()


if __name__ == "__main__":
    prompt = "画像の状況を、大正の文豪のような文章で表現してください。"
    image_path = "data/osinoko.jpeg"
    aws_bedrock_call(prompt, image_path)
