import base64
from typing import Literal

from fastapi import APIRouter, File, Form, UploadFile
from starlette.responses import StreamingResponse

from src.openai_image_call import create_messages, openai_image_call

router = APIRouter()

# curlコマンド実行時は１文字ずつ返すために--no-bufferオプションを付ける
@router.post("/")
async def descript_image_response(
    image: UploadFile = File(...),
    mediatype: Literal["jpeg", "png"] = Form(...),
):
    image_bytes = await image.read()
    b64_image_data = base64.b64encode(image_bytes).decode("utf-8")
    message = create_messages(b64_image_data, mediatype, "descript")
    return StreamingResponse(
        openai_image_call(message),
        media_type="text/event-stream",
    )
