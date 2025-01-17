from fastapi import APIRouter
from starlette.responses import StreamingResponse

from app.schemas import Text
from src.openai_call import openai_call
from src.prompts.vocabulary_prompt import HURIGANA_PROMPT


def create_messages(raw_text: str):
    messages = [
        {
            "role": "system",
            "content": "あなたは世界で一番漢字に精通した人間です。",
        },
        {
            "role": "user",
            "content": HURIGANA_PROMPT.format(raw_text=raw_text),
        },
    ]
    return messages


router = APIRouter()

# curlコマンド実行時は１文字ずつ返すために--no-bufferオプションを付ける
@router.post("/")
def hurigana_response(data: Text):
    messages = create_messages(data.text)
    return StreamingResponse(openai_call(messages), media_type="text/event-stream")
