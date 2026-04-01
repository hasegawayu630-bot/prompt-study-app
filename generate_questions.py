import json
import os
# 必要なライブラリ: pip install openai

def generate_questions():
    """
    OpenAI等のAPIを使用して、残りの問題（約290問）を自動生成し、
    JSONファイルに出力するためのスクリプトのひな形です。
    """
    print("AIを使用して「基礎から難問まで」のプロンプト勉強問題を生成します...")
    
    # AIに送信するシステムプロンプトの例（レベル別の要件定義）
    system_prompt = """
    あなたはシステム自動化の専門家向けに、JSONやプロンプトのクイズを作成するAIです。
    以下の4つの難易度（Level）に分けて、実践的かつ徐々に難しくなるクイズを生成してください。
    
    - Level 1 (完全な基礎): 「JSONとは何か」「APIのGET/POSTの違いは？」など、システム連携の基本用語問題。
    - Level 2 (文法ルール): 「Webhookの待ち構えの仕組み」「正規表現の基本的な使いどころ」など技術的な基礎ルール。
    - Level 3 (APIレベルの実装): 「kintone連携で必須となる "records" 大枠の考え方」「JSONで確実に出力させる安全なプロンプトの出し方」
    - Level 4 (例外・実践対策): 「データ欠損時の安全な例外（null）処理」「AIを使わず正規表現で100%抽出する判断基準」「Few-shotプロンプトの極意」
    """
    
    # ダミーの生成結果例（APIから受け取ったと仮定）
    generated_data = [
        {
            "id": 11,
            "title": "Level 1: JSONの波括弧",
            "question": "JSONにおいて、{ } (波括弧) で囲まれたものは何を意味しますか？",
            "options": [
                "リスト（複数の値の並び）",
                "オブジェクト（キーと値のペアのまとまり）",
                "単なる文字列",
                "コメントアウト（プログラムに無視される部分）"
            ],
            "correctAnswer": 1,
            "explanation": "JSONでは、{} はキーと値のペアを持つ「オブジェクト」を作ります。リスト（配列）を作るときは [] (角括弧) を使い、これがJSONのもっとも基礎的なルールになります。"
        }
    ]
    
    # ReactアプリがインポートできるJSONファイルとして出力
    with open('src/generated_questions.json', 'w', encoding='utf-8') as f:
        json.dump(generated_data, f, ensure_ascii=False, indent=2)
        
    print("新しい問題データを src/generated_questions.json に保存しました！")
    print("データを追加する場合は、Reactアプリ（questions.js または App.jsx）でこのJSONを読み込むように修正します。")

if __name__ == "__main__":
    generate_questions()
