# FastAPI_sample

## 事前準備
ルートディレクトリに以下の内容の`.env`を置く
※`COTOMI_API_KEY`, `COTOMI_BASE_URL`, `COTOMI_MODEL`の３つは必ず埋める
```
COTOMI_API_KEY=
COTOMI_BASE_URL=
COTOMI_MODEL=

AWS_USERNAME=
AWS_PASSWORD=
AWS_CONSOLE_SITE=

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

AZURE_OPENAI_MODEL=
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_API_KEY=

AZURE_AI_SEARCH_ENDPOINT=
AZURE_AI_SEARCH_API_KEY=
```

## 実行コマンド
```
poetry install

# API立ち上げ
poetry run uvicorn app.main:app --reload

# test実行
poetry run pytest
```

## API呼び出し・ドキュメント
- http://127.0.0.1:8000/ にアクセス->デフォルトのGETメソッド呼び出し結果が出力
- http://127.0.0.1:8000/docs にアクセス->APIドキュメントが表示
- APIドキュメントの各メソッド内を開いたところにある「Try it out」でテストデータを入力して「Execute」によりAPI呼び出しが可能
- 呼び出す際のcurlコマンドも表示される

## 注意点
- `cotomi`POSTメソッド呼び出し時は１文字ずつstreaming形式で返すために`curl`コマンドにて`--no-buffer`オプションを付ける

