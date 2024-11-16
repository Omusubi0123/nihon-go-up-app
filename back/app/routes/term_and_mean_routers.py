from fastapi import APIRouter
from starlette.responses import StreamingResponse

from app.schemas import Text
from src.cotomi_call import cotomi_call
from src.prompts.vocabulary_prompt import TERM_AND_MEAN_PROMPT


def create_messages(raw_text: str):
    messages = [
        {
            "role": "system",
            "content": "あなたは世界一優秀な漢字の読み方を理解する能力者です。",
        },
        {
            "role": "user",
            "content": TERM_AND_MEAN_PROMPT.format(raw_text=raw_text),
        },
    ]
    return messages


router = APIRouter()

# curlコマンド実行時は１文字ずつ返すために--no-bufferオプションを付ける
@router.post("/")
def term_and_mean_response(data: Text):
    messages = create_messages(data.text)
    return StreamingResponse(cotomi_call(messages), media_type="text/event-stream")
