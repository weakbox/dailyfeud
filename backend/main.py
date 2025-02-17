import os
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from thefuzz import process
from openai import OpenAI

load_dotenv()

class GuessRequest(BaseModel):
    text: str

app = FastAPI()

# Template question for formatting purposes:
QUESTION = "Name an object in your living room."
ANSWER_SET = {
    "tv": {"tv", "television", "screen", "flat screen", "monitor"},
    "couch": {"couch", "sofa", "settee", "divan", "loveseat"},
    "lamp": {"lamp", "light", "light fixture", "table lamp", "floor lamp"},
    "table": {"table", "coffee table", "side table", "dining table", "desk"},
    "bookshelf": {"bookshelf", "bookcase", "shelf", "book stand"},
    "clock": {"clock", "wall clock", "timepiece", "alarm clock", "grandfather clock"}
}
ANSWER_SET_FLATTENED = {synonym: key for key, synonyms in ANSWER_SET.items() for synonym in synonyms}
THRESHOLD = 80  # It's currently pretty generous. Especially when including one word in a multi-word answer (e.g. "coffee" -> "coffee table").

def generate_answer_set(question: str):
    prompt = f"Given the following question: {question}, provide a list of the 3-8 most common answers in the following format: {ANSWER_SET}. The answers should be sorted by most popular, similar to Family Feud."

    client = OpenAI(
        base_url="https://models.inference.ai.azure.com",
        api_key=os.environ["OPENAI_API_KEY"],
    )

    response = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "",
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

@app.get("/")
async def root():
    test = generate_answer_set("Name A Job Where It Would Be Okay To Yell At Work.")
    print(test)

    return {
        "message": "Hello! This is the DailyFeud backend.",
        "creator": "Connor 'weakbox' McLeod"
    }

@app.post("/submit-guess/")
async def submit_guess(guess: GuessRequest):
    text = guess.text.strip().lower()

    response = {
        "correct_answer": None,
        "match_ratio": None,
        "message": "Please provide a valid guess!"
    }

    if not text:
        return response

    best_match, best_score = process.extractOne(text, ANSWER_SET_FLATTENED.keys())
    response["match_ratio"] = best_score

    if best_score >= THRESHOLD:
        response.update({
            "correct_answer": ANSWER_SET_FLATTENED[best_match],
            "message": "Correct guess!"
        })
    else:
        response["message"] = "Incorrect guess. Please try again!"

    return response
