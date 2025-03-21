import os
import psycopg
from typing import List, Dict, Optional
from models import QuestionModel, AnswerModel

DATABASE_URL = os.getenv("DATABASE_URL")

def get_connection():
    """
    Get a connection to the database and enable foreign key constraints.
    """
    conn = psycopg.connect(DATABASE_URL)

    # Just for debugging right now!
    with conn.cursor() as cur:
        cur.execute("SELECT version()")
        print(cur.fetchone())

    return conn

def initialize_database() -> None:
    """
    Initialize the database with the required tables if they don't already exist.
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS questions (
                    id SERIAL PRIMARY KEY,
                    question TEXT NOT NULL UNIQUE
                )
            """)
            
            cur.execute("""
                CREATE TABLE IF NOT EXISTS answers (
                    id SERIAL PRIMARY KEY,
                    question_id INTEGER NOT NULL,
                    position INTEGER NOT NULL,
                    answer TEXT NOT NULL,
                    synonyms TEXT[] NOT NULL,
                    points INTEGER NOT NULL,
                    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
                )
            """)

    print("Database was sucessfully initialized!")

def store_question(question: QuestionModel) -> None:
    """
    Store a question, answers and synonyms in the database.
    """
    with get_connection() as conn:
        with conn.cursor() as cur:

            question_id = cur.execute("""
                INSERT INTO questions (question)
                VALUES (%s)
                RETURNING id;
                """, 
                (question.question,)).fetchone()[0]

            for answer, answer_model in question.answers.items():
                cur.execute("""
                    INSERT INTO answers (question_id, position, answer, synonyms, points)
                    VALUES (%s, %s, %s, %s, %s);
                    """, 
                    (question_id, answer_model.position, answer, answer_model.synonyms, answer_model.value,))



def retrieve_latest_question_id() -> Optional[str]:
    """
    Retrieve the latest question ID from the questions table.
    """
    with get_connection() as con:
        cur = con.cursor()
        cur.execute("""
            SELECT id FROM questions 
            ORDER BY id DESC
            LIMIT 1
        """)
        result = cur.fetchone()
    
    return str(result[0]) if result else None

def retrieve_question(id: int) -> QuestionModel:
    """
    Retrieve a question, answers, and synonyms from the database.
    """
    with get_connection() as con:
        cur = con.cursor()
        cur.execute("""
            SELECT question, answer, synonym, points, position
            FROM questions 
            JOIN answers
            ON questions.id = answers.question_id
            JOIN synonyms 
            ON answers.id = synonyms.answer_id 
            WHERE question_id = ?
            """, (id,))
        
        results = cur.fetchall()
    
    if not results:
        raise ValueError(f"Question with ID {id} not found.")

    question = results[0][0]
    answers = {}

    for _, answer, synonym, points, position in results:
        if answer not in answers:
            answers[answer] = AnswerModel(position=position, value=points, synonyms=[answer])
        answers[answer].synonyms.append(synonym)

    return QuestionModel(question=question, answers=answers)

def retrieve_question_prompt(id: int) -> dict[str, int | str]:
    """
    Retrieve a question prompt and number of answers from the database based off of the question's ID.
    """
    with get_connection() as con:
        cur = con.cursor()
        cur.execute("""
                    SELECT question, COUNT(*)
                    FROM questions 
                    JOIN answers
                    ON questions.id = answers.question_id
                    WHERE question_id = ?
                    """, (id,))
        result = cur.fetchone()

    if result is None or result[0] is None:
        raise ValueError(f"Question with ID {id} not found.")

    return {
        "prompt": result[0],
        "count": result[1],
    }

def retrieve_all_question_prompts() -> List[Dict[str, int | str]]:
    """
    Retrieve all question prompts from the database.
    """
    con = get_connection()
    cur = con.cursor()

    cur.execute("SELECT id, question FROM questions")
    result = cur.fetchall()
    con.close()

    prompts = []
    for row in result:
        prompts.append({
            "id": row[0],
            "prompt": row[1]
        })

    return prompts

def retrieve_all_answers(id: int):
    """
    Retrieve all answers for a given question ID from the database.
    """
    con = get_connection()
    cur = con.cursor()

    cur.execute("SELECT answer, points, position FROM answers WHERE question_id = ?", (id,))
    result = cur.fetchall()
    con.close()

    answers = []
    for row in result:
        answers.append({
            "correct": False,
            "answer": row[0],
            "points": row[1],
            "position": row[2]
        })

    return answers
