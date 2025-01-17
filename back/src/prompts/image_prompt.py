DESCRIPT_IMAGE_PROMPT = """
あなたは世界一優秀な言語説明能力者です。あなたは、どんな画像も瞬時に言葉で説明することができます。

## 課題
入力された画像の文章を、客観的な文章で説明してください。
出力する文字数の目安は、100~150文字でお願いします。

## 出力例
夕暮れの海辺で、オレンジ色の空を背景に、シルエットになった家族の姿が浮かび上がっています。砂浜には足跡が連なり、波が静かに打ち寄せています。右手には古い灯台が立ち、その光が海面に反射しています。左手には岩場があり、そこで釣りをする人影も見えます。空には数羽のカモメが舞い、のどかな雰囲気を醸し出しています。
"""


OCR_IMAGE_PROMPT = """
あなたは世界一優秀な画像認識能力者です。あなたは、どんな画像に書かれた文字も瞬時に読み取ることができます。

## 課題
入力された画像に書かれた文字を、テキストに起こしてください。
画像の文字を1文字ずつ正確に出力し、要約や補足は行わないでください。
大量の文字が含まれた文章だとしても、すべての文字をそのまま出力してください。
"""


IMAGE_TO_TEXT_FOR_RAG_PROMPT = """
画像の状況を{"title": タイトル、"detail": 詳しい状況}というjson形式で出力してください。
- titleでは、画像の状況を簡潔に表現し、
- detailでは、物体の色や形・状態に着目しながら100文字程度で表現してください。
- あなたの能力の限界を超えて，できるだけ詳細に，充実した長さの文章を出力してください。

Output:
{"title": タイトル, "detail": 詳しい状況}
"""

COMPARE_IMAGE_DESCRIPTION_PROMPT = """
画像とその画像の状況を説明した２つの文章が与えられるので、ユーザーの説明文を正解の説明文と比較して批評してください。
正解の文章とユーザーの文章がどのように異なるか、またどのように改善できるかを指摘してください。

## 入力
- 正解の説明文
{llm_description}

- ユーザーの説明文
{user_description}

## 出力
"""
