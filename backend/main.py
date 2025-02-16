from fastapi import FastAPI
from pydantic import BaseModel
from thefuzz import process

class GuessRequest(BaseModel):
    text: str

app = FastAPI()

ANSWER_SET = {"red", "orange", "yellow", "green", "blue", "purple"}
THRESHOLD = 80

@app.get("/")
async def root():
    return {"message": "Written and developed by Connor McLeod"}

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

    best_match, best_score = process.extractOne(text, ANSWER_SET)
    response["match_ratio"] = best_score

    if best_score >= THRESHOLD:
        response.update({
            "correct_answer": best_match,
            "message": "Correct guess!"
        })

    return response
