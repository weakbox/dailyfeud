from pydantic import BaseModel
from typing import Dict, List

class QuestionRequest(BaseModel):
    prompt: str

class GuessRequest(BaseModel):
    guess: str

class AnswerModel(BaseModel):
    value: int
    synonyms: List[str]

class QuestionModel(BaseModel):
    question: str
    answers: Dict[str, AnswerModel]
