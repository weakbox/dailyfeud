import os
from dotenv import load_dotenv
from models import QuestionModel
from openai import OpenAI

load_dotenv()

def generate_question(question: str) -> QuestionModel:
    prompt = f"""
    Given the following question: "{question}", provide a list of 3-8 possible answers and their synonyms in the following JSON format. The answers should be ranked by how likely they are to be given in a Family Feud-style survey, with the total points summing up to 100.

    Each answer should have a "value" between 0 and 100, where the most popular answer gets the highest value, and all values should add up to 100.

    The format should be as follows:

    {{
        "question": "{question}",
        "answers": {{
            "answer 1": {{
                "position": 1
                "value": x1,  # Points should sum up to 100
                "synonyms": ["synonym 1", "synonym 2", "synonym 3", ...]
            }},
            "answer 2": {{
                "position": 2
                "value": x2,
                "synonyms": ["synonym 1", "synonym 2", "synonym 3", ...]
            }},
            "answer 3": {{
                "position": 3
                "value": x3,
                "synonyms": ["synonym 1", "synonym 2", "synonym 3", ...]
            }},
            "answer 4": {{
                "position": 4
                "value": x4,
                "synonyms": ["synonym 1", "synonym 2", "synonym 3", ...]
            }},
            ...
        }}
    }}

    For example, for the question "Name an object in your living room", the response could be:

    {{
        "question": "Name an object in your living room",
        "answers": {{
            "tv": {{
                "position": 1
                "value": 49,
                "synonyms": ["television", "screen", "monitor"]
            }},
            "couch": {{
                "position": 2
                "value": 24,
                "synonyms": ["sofa", "settee", "loveseat"]
            }},
            "lamp": {{
                "position": 3
                "value": 16,
                "synonyms": ["table lamp", "floor lamp"]
            }},
            "table": {{
                "position": 4
                "value": 11,
                "synonyms": ["coffee table", "side table", "desk"]
            }}
        }}
    }}

    The answers should be sorted by the most popular, similar to Family Feud. Do not include any markdown or code block indicators. The total value should sum up to 100 across all answers.
    """

    client = OpenAI(
        base_url="https://models.inference.ai.azure.com",
        api_key=os.environ["OPENAI_API_KEY"],
    )

    response = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are an assistant designed to help generate lists of possible answers to questions in a specific format, like Family Feud, with answers having associated values that sum up to 100.",
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

    return QuestionModel.parse_raw(model_response)
