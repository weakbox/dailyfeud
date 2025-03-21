from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from thefuzz import process, fuzz
from answers import *
from database import *
from utils import flatten_answer_set
from models import QuestionRequest, GuessRequest, QuestionModel
from typing import List, Dict

load_dotenv()
allowed_origin = os.getenv("FRONTEND_URL", "*")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[allowed_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

initialize_database()

THRESHOLD = 80

@app.get("/")
async def root() -> None:
    return {
        "greeting": "Hello! This is the backend for DailyFeud.",
        "creator": "Connor McLeod"
    }

@app.get("/get-latest-question-id/")
async def get_latest_question_id() -> str:
    return retrieve_latest_question_id()

@app.post("/create-question/")
async def create_question(request: QuestionRequest) -> QuestionModel:
    """
    Generates and stores a question based off of a given prompt.
    """
    prompt = request.prompt.strip()
    question = generate_question(prompt)
    store_question(question)
    return question

@app.get("/get-question-prompt/{id}")
async def get_question_prompt(id: int) -> Dict[str, int | str]:
    """
    Retrieves the prompt of a question and its number of answers from the database based off of its ID.
    """
    try:
        return retrieve_question_prompt(id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")

@app.get("/get-all-question-prompts/")
async def get_all_question_prompts() -> List[Dict[str, int | str]]:
    """
    Retrieves the entire list of question prompts from the database.
    """
    return retrieve_all_question_prompts()

@app.get("/get-all-answers/{id}")
async def get_all_answers(id: int):
    """
    Retrieves the entire list of answers for a given question ID from the database.
    """
    return retrieve_all_answers(id)

@app.post("/submit-guess/")
async def submit_guess(request: GuessRequest) -> dict:
    """
    Submits a guess for a question and returns whether or not it is correct.
    """
    try:
        question = retrieve_question(request.id)

        guess = request.guess.strip().lower()

        answer_set = question.answers
        flat_answer_set = flatten_answer_set(answer_set)

        best_match, best_score = process.extractOne(guess, flat_answer_set.keys(), scorer=fuzz.token_set_ratio)

        print("TheFuzz Scoring Opinion: ", f"{guess} -> {best_match}", flat_answer_set[best_match], best_score)

        if best_score >= THRESHOLD:
            return {
                "correct": True,
                "position": answer_set[flat_answer_set[best_match]].position,
                "answer": flat_answer_set[best_match],
                "value": answer_set[flat_answer_set[best_match]].value,
            }

        return {
            "correct": False,
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
