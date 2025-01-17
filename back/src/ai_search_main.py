import json
import os

from src.ai_search_support import (
    create_index,
    create_index_documents,
    delete_index,
    hybrid_search,
    upload_documents,
)


def main(
    index_name: str,
    create: bool = False,
    delete: bool = False,
    upload: bool = False,
    search: bool = True,
    load_path: str = os.path.join("data", "filesearch", "dog_use.json"),
    save_path: str = os.path.join("data", "filesearch", "dog_use_vector.json"),
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
    if create:
        create_index(index_name)
    if delete:
        delete_index(index_name)
    if upload:
        create_index_documents(load_path, save_path)
        upload_documents(index_name, save_path)
    if search:
        while True:
            query = input("Q: ")
            results = hybrid_search(index_name, query, top=30)

            result_dict: dict[str, list] = {
                "id": [],
                "title": [],
                "search.score": [],
                "content": [],
            }
            for result in results:
                result_dict["id"].append(result["id"])
                result_dict["title"].append(result["title"])
                result_dict["search.score"].append(result["@search.score"])
                result_dict["content"].append(result["content"])
            result_str = json.dumps(result_dict, ensure_ascii=False, indent=4)
            print(result_str)


if __name__ == "__main__":
    from fire import Fire  # type: ignore

    Fire(main)

# poetry run python src/ai_search_main.py --index_name=dog_image_retrieval
