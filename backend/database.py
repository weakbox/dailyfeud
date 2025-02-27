import sqlite3
from models import QuestionModel, AnswerModel
from typing import List, Dict

DATABASE_PATH = "database.db"

def get_connection():
    """
    Get a connection to the database and enable foreign key constraints.
    """
    con = sqlite3.connect(DATABASE_PATH)
    con.execute("PRAGMA foreign_keys = 1")
    return con

def initialize_database() -> None:
    """
    Initialize the database with the required tables if they don't already exist.
    """
    con = get_connection()
    cur = con.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL UNIQUE
        )
    """)
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER NOT NULL,
            answer TEXT NOT NULL,
            points INTEGER NOT NULL DEFAULT 0,
            position INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS synonyms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            answer_id INTEGER NOT NULL,
            synonym TEXT NOT NULL,
            FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE
        )
    """)

    # CREATE TABLE auto-commits.
    con.close()

def store_question(question: QuestionModel) -> None:
    """
    Store a question, answers and synonyms in the database.
    """
    con = get_connection()
    cur = con.cursor()

    cur.execute("INSERT INTO questions VALUES(NULL, ?)", (question.question,))
    question_id = cur.lastrowid

    for answer, answer_model in question.answers.items():
        cur.execute("INSERT INTO answers VALUES(NULL, ?, ?, ?, ?)", (question_id, answer, answer_model.value, answer_model.position))
        answer_id = cur.lastrowid

        for synonym in answer_model.synonyms:
            cur.execute("INSERT INTO synonyms VALUES(NULL, ?, ?)", (answer_id, synonym))

    con.commit()
    con.close()

def retrieve_question(id: int) -> QuestionModel:
    """
    Retrieve a question, answers, and synonyms from the database.
    """
    con = get_connection()
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
    
    question = results[0][0]
    answers = {}

    for _, answer, synonym, points, position in results:
        if answer not in answers:
            answers[answer] = AnswerModel(position=position, value=points, synonyms=[answer])
        answers[answer].synonyms.append(synonym)

    con.close()

    return QuestionModel(question=question, answers=answers)

def retrieve_question_prompt(id: int) -> str:
    """
    Retrieve a question prompt from the database based off of the question's ID.
    """
    # Use a "with" statement here?
    con = get_connection()
    cur = con.cursor()

    cur.execute("""
                SELECT question FROM questions 
                WHERE questions.id = ?
                """, (id,))
    result = cur.fetchone()
    con.close()

    return result[0] if result else ""

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
