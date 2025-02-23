from fastapi import FastAPI
from thefuzz import process
from answers import *
from database import *
from utils import flatten_answer_set
from models import QuestionRequest, GuessRequest, QuestionModel

app = FastAPI()
initialize_database()

THRESHOLD = 80  # It's currently pretty generous. Especially when including one word in a multi-word answer (e.g. "coffee" -> "coffee table").

@app.get("/")
async def root() -> None:
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

@app.get("/get-question-prompt/{id}")
async def get_question_prompt(id: int) -> str:
    """
    Retrieves the prompt of a question from the database based off of its ID.
    """
    return retrieve_question_prompt(id)

@app.post("/submit-guess/")
async def submit_guess(request: GuessRequest) -> dict:
    """
    Submits a guess for a question and returns whether or not it is correct.
    """
    question = retrieve_question(request.id)
    # TODO: Check if question exists:

    guess = request.guess.strip().lower()
    # TODO: Check if guess is valid:

    answer_set = question.answers
    flat_answer_set = flatten_answer_set(answer_set)

    best_match, best_score = process.extractOne(guess, flat_answer_set.keys())

    if best_score >= THRESHOLD:
        return {
            "correct": True,
            "answer": flat_answer_set[best_match],
            "score": best_score
        }

    return {
        "correct": False,
        "answer": None,
        "score": None
    }
