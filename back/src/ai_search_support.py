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
from openai import OpenAI

from src.settings import settings

client = OpenAI(api_key=settings.openai_api_key)

search_index_client = SearchIndexClient(
    settings.azure_ai_search_endpoint,
    AzureKeyCredential(settings.azure_ai_search_api_key),
)


def create_index(
    index_name: str,
    embd_content: bool = True,
    search_dimensions: int = 3072,
):
    """Indexを作成

    Args:
        index_name (str): Index名
        embd_content (bool, optional): content(全文)をembeddingするか. Defaults to False.
        search_dimensions (int, optional): embeddingの次元数. Defaults to 3072 (text-embedding-3-largeの出力次元数).
    """
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

    result = search_index_client.create_index(index)
    print(f" <{result.name} created>")
    return result


def delete_index(index_name: str):
    """Indexを削除

    Args:
        index_name (str): Index名
    """
    result = search_index_client.delete_index(index_name)
    print(f" <{index_name} deleted>")
    return result


def generate_embeddings(text: str, model: str):
    """embeddingを行う

    Args:
        text (str): embeddingしたい文章
        model (str): embeddingモデル名
    """
    text = text.replace("\n", " ")
    response = client.embeddings.create(input=text, model=model)
    return response.data[0].embedding


def create_index_documents(
    load_path: str,
    save_path: str,
    embd_content: bool = True,
):
    """Indexに登録するドキュメントを作成
       title(ファイルパス), content(全文)をキーに持つjsonが存在していることを前提とする

    Args:
        load_path (str): ドキュメントのjsonファイルパス
        save_path (str): 生成したドキュメントのjsonファイルパス
        embd_content (bool, optional): contentをembeddingするか. Defaults to False.
    """
    with open(load_path, "r", encoding="utf-8") as f:
        documents = json.load(f)

    for i, document in enumerate(documents, start=1):
        print(f"Processing: {i}")
        if embd_content:
            content = document["content"]
            content_embeddings = generate_embeddings(
                client, content, settings.openai_embedding_model
            )
            document["contentVector"] = content_embeddings
        if i % 100 == 0:
            with open(save_path, "w") as f:
                json.dump(documents, f, ensure_ascii=False, indent=4)

    with open(save_path, "w") as f:
        json.dump(documents, f, ensure_ascii=False, indent=4)


def upload_documents(index_name: str, doc_path: str, batch_size: int = 100):
    """Indexにドキュメントをアップロード

    Args:
        index_name (str): Index名
        doc_path (str): ドキュメントのjsonファイルパス
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
    index_name: str,
    query: str,
    vector_content: bool = True,
    top: int = 30,
):
    """Azure Hybrid Search

    Args:
        index_name (str): Index名
        query (str): 検索クエリ
        vector_content (bool, optional): queryをembeddingして検索するか. Defaults to False.
        top (int, optional): 結果取得数. Defaults to 10.

    Returns:
        _type_: 検索結果
    """
    search_client = SearchClient(
        endpoint=settings.azure_ai_search_endpoint,
        index_name=index_name,
        credential=AzureKeyCredential(settings.azure_ai_search_api_key),
    )

    vectors = []
    if vector_content:
        query_embd = generate_embeddings(client, query, settings.openai_embedding_model)
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
