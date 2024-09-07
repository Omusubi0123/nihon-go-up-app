from typing import Literal

from fastapi import APIRouter
from starlette.responses import StreamingResponse

from app.schemas import TextComplexity
from src.cotomi_call import cotomi_call
from src.prompts.vocabulary_prompt import (
    TO_EASY_VOCABULARY_PROMPT,
    TO_HARD_VOCABULARY_PROMPT,
)


def create_messages(raw_text: str, mode: Literal["easy", "hard"]):
    if mode == "easy":
        prompt = TO_EASY_VOCABULARY_PROMPT.format(difficult_text=raw_text)
    elif mode == "hard":
        prompt = TO_HARD_VOCABULARY_PROMPT.format(easy_text=raw_text)
    else:
        raise ValueError("mode must be 'easy' or 'hard'")
    messages = [
        {
            "role": "system",
            "content": "あなたは文章をより語彙の難しい文章や易しい文書に変換することが世界で一番得です。",
        },
        {
            "role": "user",
            "content": prompt,
        },
    ]
    return messages


router = APIRouter()

# curlコマンド実行時は１文字ずつ返すために--no-bufferオプションを付ける
@router.post("/")
def flex_complexity_text_response(data: TextComplexity):
    messages = create_messages(data.raw_text, data.mode)
    return StreamingResponse(cotomi_call(messages), media_type="text/event-stream")
