import sqlite3
from answers import *

DATABASE_PATH = "database2.db"

def get_connection():
    con = sqlite3.connect(DATABASE_PATH)
    con.execute("PRAGMA foreign_keys = 1")
    return con

def initialize_database() -> None:
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

def insert_question(question: str) -> None:
    answer_set = generate_answer_set(question)

    # TODO: Add an error check if generation goes wrong.
    con = get_connection()
    cur = con.cursor()

    cur.execute("INSERT INTO questions VALUES(NULL, ?)", (question,))
    question_id = cur.lastrowid

    for answer, synonyms in answer_set.items():
        points = 0
        cur.execute("INSERT INTO answers VALUES(NULL, ?, ?, ?)", (question_id, answer, points))
        answer_id = cur.lastrowid

        for synonym in synonyms:
            cur.execute("INSERT INTO synonyms VALUES(NULL, ?, ?)", (answer_id, synonym))

    con.commit()
    con.close()

def get_answer_set(question_id: int) -> dict:
    con = get_connection()
    cur = con.cursor()

    cur.execute("""
        SELECT answer, synonym 
        FROM answers JOIN synonyms 
        ON answers.id = synonyms.answer_id 
        WHERE question_id = ?
        """, (question_id,))
    
    results = cur.fetchall()

    answer_set = {}
    for answer, synonym in results:
        if answer not in answer_set:
            answer_set[answer] = set()
        answer_set[answer].add(synonym)
    
    con.close()
    return answer_set
