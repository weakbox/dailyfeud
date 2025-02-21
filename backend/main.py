from fastapi import FastAPI
from pydantic import BaseModel
from thefuzz import process
from answers import *
from database import *
from models import QuestionRequest, GuessRequest, QuestionModel

app = FastAPI()
initialize_database()

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
        "greeting": "Hello! This is the backend for DailyFeud.",
        "creator": "Connor McLeod"
    }

@app.post("/create-question/")
async def create_question(request: QuestionRequest) -> QuestionModel:
    """
    Generates and stores a question based off of a given prompt.
    """
    prompt = request.prompt.strip()
    question = generate_question(prompt)
    store_question(question)
    return question

@app.get("/get-question/{id}")
async def get_question(id: int) -> QuestionModel:
    """
    Retrieves a question from the database based off of its ID.
    """
    return retrieve_question(id)

@app.post("/submit-guess/")
async def submit_guess(request: GuessRequest):
    guess = request.guess.strip().lower()

    response = {
        "correct_answer": None,
        "match_ratio": None,
        "message": "Please provide a valid guess!"
    }

    if not guess:
        return response

    best_match, best_score = process.extractOne(guess, ANSWER_SET_FLATTENED.keys())
    response["match_ratio"] = best_score

    if best_score >= THRESHOLD:
        response.update({
            "correct_answer": ANSWER_SET_FLATTENED[best_match],
            "message": "Correct guess!"
        })
    else:
        response["message"] = "Incorrect guess. Please try again!"

    return response
