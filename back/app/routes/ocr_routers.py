import base64
import json
from typing import Literal

from fastapi import APIRouter, File, Form, UploadFile
from starlette.responses import StreamingResponse

from app.schemas import ImageData
from src.aws_bedrock_call import aws_bedrock_call
from src.prompts.image_prompt import OCR_IMAGE_PROMPT


def create_body(
    image_bytes: bytes,
    mediatype: Literal["jpeg", "png"],
) -> str:
    messages = [
        {"role": "user", "content": [{"type": "text", "text": OCR_IMAGE_PROMPT}]},
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
            "max_tokens": 4000,
            "temperature": 0.5,
            "messages": messages,
        }
    )
    return body


router = APIRouter()

# curlコマンド実行時は１文字ずつ返すために--no-bufferオプションを付ける
@router.post("/")
async def ocr_image_response(
    image: UploadFile = File(...),
    mediatype: str = Form(...),
):
    image_bytes = await image.read()
    body = create_body(image_bytes, mediatype)
    return StreamingResponse(
        aws_bedrock_call(body),
        media_type="text/event-stream",
    )
