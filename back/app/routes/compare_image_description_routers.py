import base64
from typing import Literal

from fastapi import APIRouter, File, Form, UploadFile
from starlette.responses import StreamingResponse

from src.openai_image_call import create_compare_messages, openai_image_call

router = APIRouter()

# curlコマンド実行時は１文字ずつ返すために--no-bufferオプションを付ける
@router.post("/")
async def compare_user_and_llm_image_description_response(
    image: UploadFile = File(...),
    mediatype: Literal["jpeg", "png"] = Form(...),
    llm_description: str = Form(...),
    user_description: str = Form(...),
):
    image_bytes = await image.read()
    b64_image_data = base64.b64encode(image_bytes).decode("utf-8")
    messages = create_compare_messages(
        b64_image_data, mediatype, llm_description, user_description
    )
    return StreamingResponse(
        openai_image_call(messages),
        media_type="text/event-stream",
    )
