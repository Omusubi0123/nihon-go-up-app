from openai import AzureOpenAI

from src.ai_search_support import hybrid_search
from src.settings import Settings


def ai_search_call(
    query: str,
    index_name: str = "dog_image_retrieval",
):
    """AI Searchのメイン処理

    Args:
        index_name (str): Index名
        create (bool, optional): Indexを作成するか. Defaults to False.
        upload (bool, optional): Indexにドキュメントを追加するか. Defaults to False.
        search (bool, optional): AI searchの検索を行うか. Defaults to True.
        load_path (str, optional): ドキュメントのjsonファイルパス. Defaults to os.path.join("ai_search", "data", "filesearch", "filesearch_data.json").
        save_path (str, optional): ベクトル埋め込み付きドキュメントデータのファイルパス. Defaults to os.path.join("ai_search", "data", "filesearch", "filesearch_vector.json").
    """
    settings = Settings()

    client = AzureOpenAI(
        api_key=settings.azure_embedding_api_key,
        api_version=settings.azure_openai_version,
        azure_endpoint=settings.azure_openai_endpoint,
    )

    results = hybrid_search(
        client, index_name, query, settings, model=settings.azure_embedding_modelname
    )

    result_dict: dict[str, list] = {
        "id": [],
        "title": [],
        "score": [],
        "content": [],
    }
    for result in results:
        result_dict["id"].append(result["id"])
        result_dict["title"].append(result["title"])
        result_dict["score"].append(result["@search.score"])
        result_dict["content"].append(result["content"])
    return result_dict
