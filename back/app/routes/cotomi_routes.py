from fastapi import APIRouter
from starlette.responses import StreamingResponse

from app.schemas import Cotomi
from src.cotomi_call import cotomi_call

router = APIRouter()

# curlコマンド実行時は１文字ずつ返すために--no-bufferオプションを付ける
@router.post("/")
def create_cotomi_response(data: Cotomi):
    return StreamingResponse(cotomi_call(data.prompt), media_type="text/event-stream")
