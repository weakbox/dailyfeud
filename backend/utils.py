from models import AnswerModel
from typing import Dict

def flatten_answer_set(answer_set: Dict[str, AnswerModel]) -> Dict[str, str]:
    """
    Flattens a nested dictionary of answers.
    """
    flattened_answer_set = {}
    for key, value in answer_set.items():
        synonyms = value.synonyms

        flattened_answer_set[key] = key
        for s in synonyms:
            flattened_answer_set[s] = key
            
    return flattened_answer_set
