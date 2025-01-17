from src.ai_search_support import hybrid_search


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
    results = hybrid_search(index_name, query, top=30)

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
