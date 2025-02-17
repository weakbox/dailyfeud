
import os
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

def generate_answer_set(question: str):
    prompt = f"""
    Given the following question: "{question}", provide a list of the 3-8 most common answers in the following JSON format:

    {{
        "answer 1": ["synonym 1", "synonym 2", "synonym 3", ...],
        "answer 2": ["synonym 1", "synonym 2", "synonym 3", ...],
        "answer 3": ["synonym 1", "synonym 2", "synonym 3", ...]
    }}

    For example, for the question "Name an object in your living room", the response could be:

    {{
        "tv": ["television", "screen", "monitor"],
        "couch": ["sofa", "settee", "loveseat"],
        "lamp": ["table lamp", "floor lamp"],
        "table": ["coffee table", "side table", "desk"],
        "bookshelf": ["bookcase", "shelf"],
        "clock": ["wall clock", "alarm clock"]
    }}

    The answers should be sorted by the most popular, similar to Family Feud. Do not include any markdown or code block indicators!
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

    model_response = response.choices[0].message.content

    # Try to convert into a JSON object.
    print("Debug:", model_response)
    try:
        answer_set = json.loads(model_response)
        return answer_set
    except json.JSONDecodeError as e:
        return {f"Error parsing response: {e}"}
