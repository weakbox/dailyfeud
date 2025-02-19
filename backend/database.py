import sqlite3
from answers import *

con = sqlite3.connect("database.db")
cur = con.cursor()

def initialize_database() -> None:
    cur.execute("CREATE TABLE IF NOT EXISTS questions(question)")
    cur.execute("CREATE TABLE IF NOT EXISTS answers(question_id, answer, points)")
    cur.execute("CREATE TABLE IF NOT EXISTS synonyms(answer_id, synonym)")

def insert_question(question: str) -> None:
    # Use the question to generate the answer set and associated synonyms.
    answer_set = generate_answer_set(question)

    # TODO: Add an error check here.

    cur.execute("INSERT INTO questions VALUES(?)", (question,))
    con.commit()
    question_id = cur.lastrowid

    for answer, synonyms in answer_set.items():
        points = 0
        cur.execute("INSERT INTO answers VALUES(?, ?, ?)", (question_id, answer, points))
        con.commit()
        answer_id = cur.lastrowid

        for synonym in synonyms:
            cur.execute("INSERT INTO synonyms VALUES(?, ?)", (answer_id, synonym))
            con.commit()

    res = cur.execute("SELECT * FROM questions")
    print("Questions", res.fetchone())
    res = cur.execute("SELECT * FROM answers")
    print("Answers", res.fetchall())
    res = cur.execute("SELECT * FROM synonyms")
    print("Synonyms", res.fetchall())

initialize_database()
# insert_question("Name a team in the National Hockey League.")
con.close()
