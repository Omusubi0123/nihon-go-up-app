from typing import Generator, Literal

from openai import OpenAI

from src.prompts.vocabulary_prompt import CONVERT_VOCABULARY_PROMPT
from src.settings import Settings


def flex_text_complexity(
    raw_text: str, mode: Literal["easy", "hard"]
) -> Generator[str, None, None]:
    settings = Settings()

    client = OpenAI(
        api_key=settings.cotomi_api_key,
        base_url=settings.cotomi_base_url,
    )

    response = client.chat.completions.create(
        model=settings.cotomi_model,
        messages=[
            {"role": "system", "content": "あなたは文章をより語彙の難しい文章や易しい文書に変換することが世界で一番得です。"},
            {
                "role": "user",
                "content": CONVERT_VOCABULARY_PROMPT.format(difficult_text=raw_text),
            },
        ],
        temperature=0.7,  # 出力のランダム度合い(可変)
        max_tokens=2000,  # 最大トークン数(固定)
        top_p=0.95,  # 予測する単語を上位何%からサンプリングするか(可変)
        frequency_penalty=0,  # 単語の繰り返しをどのくらい許容するか(可変)
        presence_penalty=0,  # 同じ単語をどのくらい使うか(可変)
        stop=None,  # 文章生成を停止する単語を指定する(可変)
        stream=True,
        timeout=100,
    )

    for chunk in response:
        content = chunk.choices[0].delta.content
        if type(content) == str:
            yield content


if __name__ == "__main__":
    import sys

    print("type A")
    flex_text_complexity(
        "契約の解除が相手方の重大な債務不履行に基づく場合、解除の通知を発することで、解除の効果は即時に生じる。ただし、解除が損害賠償請求を妨げるものではない。",
        "easy",
    )
    print("type B")
    flex_text_complexity(
        "遠く遥かなる峰々が夕日に染まりて、燃え立つがごとく赤く光り、山の影は大地を静かに覆い尽くし、まるで大自然がその一日を終えんとする儀式のようであった。",
        "easy",
    )
