from fastapi import FastAPI
from pydantic import BaseModel
from thefuzz import process
from answers import *

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

@app.get("/")
async def root():
    return {
        "message": "Hello! This is the DailyFeud backend.",
        "creator": "Connor 'weakbox' McLeod"
    }

@app.get("/test/")
async def root():
    question = "Name a team in the NBA."
    response = generate_answer_set(question)
    print(response)
    return {
        "test": response
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
