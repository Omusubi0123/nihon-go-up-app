import json

from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    HnswVectorSearchAlgorithmConfiguration,
    PrioritizedFields,
    SearchableField,
    SearchField,
    SearchFieldDataType,
    SearchIndex,
    SemanticConfiguration,
    SemanticField,
    SemanticSettings,
    SimpleField,
    VectorSearch,
)
from azure.search.documents.models import Vector
from openai import AzureOpenAI

from src.settings import Settings


def create_index(
    index_name: str,
    settings: Settings,
    embd_content: bool = True,
    search_dimensions: int = 3072,
):
    """Indexを作成

    Args:
        index_name (str): Index名
        settings (Settings): 設定
        field_category (bool, optional): category fieldを追加するか. Defaults to True.
        embd_title (bool, optional): title(ファイルパス)をembeddingするか. Defaults to True.
        embd_content (bool, optional): content(全文)をembeddingするか. Defaults to False.
        embd_summary (bool, optional): summaryをembeddingするか. Defaults to False.
        search_dimensions (int, optional): embeddingの次元数. Defaults to 3072 (text-embedding-3-largeの出力次元数).
    """
    search_client = SearchIndexClient(
        settings.azure_ai_search_endpoint,
        AzureKeyCredential(settings.azure_ai_search_api_key),
    )
    fields = [
        SimpleField(name="id", type=SearchFieldDataType.String, key=True),
        SearchableField(
            name="title",
            type=SearchFieldDataType.String,
            searchable=True,
            retrievable=True,
            analyzer_name="ja.microsoft",
        ),
        SearchableField(
            name="content",
            type=SearchFieldDataType.String,
            searchable=True,
            retrievable=True,
        ),
    ]
    if embd_content:
        fields.append(
            SearchField(
                name="contentVector",
                vector_search_dimensions=search_dimensions,
                type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
                searchable=True,
                vector_search_configuration="vectorConfig",
            )
        )

    vector_search = VectorSearch(
        algorithm_configurations=[
            HnswVectorSearchAlgorithmConfiguration(
                name="vectorConfig",
                kind="hnsw",
            )
        ]
    )

    semantic_config = SemanticConfiguration(
        name="my-semantic-config",
        prioritized_fields=PrioritizedFields(
            title_field=SemanticField(field_name="title"),
            prioritized_content_fields=[SemanticField(field_name="content")],
            prioritized_keywords_fields=[],
        ),
    )

    semantic_settings = SemanticSettings(configurations=[semantic_config])

    index = SearchIndex(
        name=index_name,
        fields=fields,
        vector_search=vector_search,
        semantic_settings=semantic_settings,
    )

    result = search_client.create_index(index)
    print(f" <{result.name} created>")
    return result


def delete_index(index_name: str, settings: Settings):
    """Indexを削除

    Args:
        index_name (str): Index名
        settings (Settings): 設定
    """
    search_client = SearchIndexClient(
        settings.azure_ai_search_endpoint,
        AzureKeyCredential(settings.azure_ai_search_api_key),
    )
    result = search_client.delete_index(index_name)
    print(f" <{index_name} deleted>")
    return result


def generate_embeddings(client: AzureOpenAI, text: str, model: str):
    """embeddingを行う

    Args:
        client (openai.OpenAI): OpenAIのクライアント
        text (str): embeddingしたい文章
        model (str): embeddingモデル名
    """
    text = text.replace("\n", " ")
    response = client.embeddings.create(
        input=text, model=model  # text-embedding-ada-002 のデプロイ名
    )
    return response.data[0].embedding


def create_index_documents(
    client: AzureOpenAI,
    load_path: str,
    save_path: str,
    model: str = "text-embedding-3-large",
    embd_content: bool = True,
):
    """Indexに登録するドキュメントを作成
       title(ファイルパス), content(全文)をキーに持つjsonが存在していることを前提とする

    Args:
        client (openai.OpenAI): OpenAIのクライアント
        load_path (str): ドキュメントのjsonファイルパス
        save_path (str): 生成したドキュメントのjsonファイルパス
        model (str, optional): embeddingモデル名. Defaults to "text-embedding-3-large".
        embd_title (bool, optional): titleをembeddingするか. Defaults to True.
        embd_content (bool, optional): contentをembeddingするか. Defaults to False.
        embd_summary (bool, optional): summaryをembeddingするか. Defaults to False.
    """
    with open(load_path, "r", encoding="utf-8") as f:
        documents = json.load(f)

    for i, document in enumerate(documents, start=1):
        print(f"Processing: {i}")
        if embd_content:
            content = document["content"]
            content_embeddings = generate_embeddings(client, content, model)
            document["contentVector"] = content_embeddings
        if i % 100 == 0:
            with open(save_path, "w") as f:
                json.dump(documents, f, ensure_ascii=False, indent=4)

    with open(save_path, "w") as f:
        json.dump(documents, f, ensure_ascii=False, indent=4)


def upload_documents(
    index_name: str, doc_path: str, settings: Settings, batch_size: int = 100
):
    """Indexにドキュメントをアップロード

    Args:
        index_name (str): Index名
        doc_path (str): ドキュメントのjsonファイルパス
        settings: 設定
        batch_size (int, optional): アップロードするドキュメント数のバッチサイズ. Defaults to 100.
    """
    search_client = SearchClient(
        endpoint=settings.azure_ai_search_endpoint,
        index_name=index_name,
        credential=AzureKeyCredential(settings.azure_ai_search_api_key),
    )
    with open(doc_path, "r", encoding="utf-8") as f:
        documents = json.load(f)

    for i in range(0, len(documents), batch_size):
        search_client.upload_documents(documents=documents[i : i + batch_size])
        print(f"Uploaded until {i+batch_size}/{len(documents)}")


def hybrid_search(
    client: AzureOpenAI,
    index_name: str,
    query: str,
    settings: Settings,
    vector_content: bool = True,
    custom_embedding: list[float] | None = None,
    model: str = "text-embedding-3-large",
    top: int = 30,
):
    """Azure Hybrid Search

    Args:
        client (OpenAI): OpenAIのクライアント
        index_name (str): Index名
        query (str): 検索クエリ
        settings: 設定
        vector_title (bool, optional): titleをembeddingして検索するか. Defaults to True.
        vector_summary (bool, optional): summaryをembeddingして検索するか. Defaults to False.
        model (str, optional): embeddingモデル名. Defaults to "text-embedding-3-large".
        top (int, optional): 結果取得数. Defaults to 10.

    Returns:
        _type_: 検索結果
    """
    credential = AzureKeyCredential(settings.azure_ai_search_api_key)
    search_client = SearchClient(
        endpoint=settings.azure_ai_search_endpoint,
        index_name=index_name,
        credential=credential,
    )

    vectors = []
    if vector_content:
        if not custom_embedding:
            query_embd = generate_embeddings(client, query, model)
        else:
            query_embd = custom_embedding
    if vector_content:
        vectors.append(
            Vector(
                value=query_embd,
                k=top,
                fields="contentVector",
            )
        )

    results = search_client.search(
        search_text=query,
        vectors=vectors,
        top=top,
    )
    return results
