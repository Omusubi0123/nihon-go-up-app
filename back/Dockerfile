FROM python:3.10-slim

# パッケージのアップデート & curl のインストール
RUN apt-get update && apt-get -y install curl

# 環境変数の設定
ENV PATH=/root/.local/bin/:$PATH
ENV PYTHONPATH=/app:/src

# Poetry のインストール
RUN curl -sSL https://install.python-poetry.org | python3 -

# 作業ディレクトリの設定
WORKDIR /

# Poetry の設定と依存関係のインストール
COPY pyproject.toml poetry.lock ./
RUN poetry config virtualenvs.create false
RUN poetry install --no-dev

# アプリケーションのコードをコピー
COPY app /app
COPY src /src
COPY .env ./

# ポートの公開
EXPOSE 8080

# Uvicorn でアプリケーションを実行
ENTRYPOINT ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
