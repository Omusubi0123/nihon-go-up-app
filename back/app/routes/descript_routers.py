from fastapi import APIRouter, File, Form, UploadFile
from starlette.responses import StreamingResponse

from src.openai_image_call import create_messages, openai_image_call

router = APIRouter()

# curlコマンド実行時は１文字ずつ返すために--no-bufferオプションを付ける
@router.post("/")
async def descript_image_response(
    image: UploadFile = File(...),
    mediatype: str = Form(...),
):
    image_bytes = await image.read()
    message = create_messages(image_bytes, mediatype, "descript")
    return StreamingResponse(
        openai_image_call(message),
        media_type="text/event-stream",
    )
