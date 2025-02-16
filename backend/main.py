from fastapi import FastAPI
from thefuzz import fuzz, process

app = FastAPI()

ANSWER_SET = {"red", "orange", "yellow", "green", "blue", "purple"}
THRESHOLD = 80

@app.get("/")
async def root():
    return {"message": "Written and developed by Connor McLeod"}

# Change to a POST request using a JSON body.
@app.get("/guess/")
async def guess(text: str =""):
    text = text.strip().lower()

    if not text:
       return {"answer": "Submission Error...", "ratio": None} 

    bestMatch, bestScore = process.extractOne(text, ANSWER_SET)
    if bestScore >= THRESHOLD:
        return {"answer": bestMatch, "ratio": bestScore}

    return {"answer": "Incorrect!", "ratio": None}
