
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

def generate_answer_set(question: str):
    prompt = f"""
    Given the following question: "{question}", provide a list of the 3-8 most common answers in the following format:

    {{
        "answer_1": {{"synonym_1", "synonym_2", "synonym_3"}},
        "answer_2": {{"synonym_1", "synonym_2", "synonym_3"}},
        "answer_3": {{"synonym_1", "synonym_2", "synonym_3"}},
        ...
    }}

    For example, for the question "Name an object in your living room", the response could be:

    {{
        "tv": {{"television", "screen", "monitor"}},
        "couch": {{"sofa", "settee", "loveseat"}},
        "lamp": {{"table lamp", "floor lamp"}},
        "table": {{"coffee table", "side table", "desk"}},
        "bookshelf": {{"bookcase", "shelf"}},
        "clock": {{"wall clock", "alarm clock"}}
    }}

    The answers should be sorted by the most popular, similar to Family Feud.
    """

    client = OpenAI(
        base_url="https://models.inference.ai.azure.com",
        api_key=os.environ["OPENAI_API_KEY"],
    )

    response = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are an assistant designed to help generate lists of possible answers to questions in a specific format, like Family Feud.",
            },
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model="gpt-4o",
        temperature=1,
        max_tokens=4096,
        top_p=1
    )

    return response.choices[0].message.content
