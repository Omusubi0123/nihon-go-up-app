import base64
import json
from typing import Literal

from fastapi import APIRouter, File, Form, UploadFile
from starlette.responses import StreamingResponse

from src.aws_bedrock_call import aws_bedrock_call
from src.prompts.image_prompt import COMPARE_IMAGE_DESCRIPTION_PROMPT


def create_body(
    image_bytes: bytes,
    mediatype: Literal["jpeg", "png"],
    llm_description: str,
    user_description: str,
) -> str:
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": COMPARE_IMAGE_DESCRIPTION_PROMPT.format(
                        llm_description=llm_description,
                        user_description=user_description,
                    ),
                }
            ],
        },
    ]
    messages[0]["content"].append(
        {
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": f"image/{mediatype}",
                "data": base64.b64encode(image_bytes).decode("utf-8"),
            },
        }
    )
    body = json.dumps(
        {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 2000,
            "temperature": 0.5,
            "messages": messages,
        }
    )
    return body


router = APIRouter()

# curlコマンド実行時は１文字ずつ返すために--no-bufferオプションを付ける
@router.post("/")
async def compare_user_and_llm_image_description_response(
    image: UploadFile = File(...),
    mediatype: str = Form(...),
    llm_description: str = Form(...),
    user_description: str = Form(...),
):
    image_bytes = await image.read()
    body = create_body(image_bytes, mediatype, llm_description, user_description)
    return StreamingResponse(
        aws_bedrock_call(body),
        media_type="text/event-stream",
    )
