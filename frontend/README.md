# DailyFeud

## Core Features
- **Magic Answer Matching**: Say goodbye to the frustration of "How did that not count?" With OpenAI's GPT-4 and TheFuzz, answers are matched with flexibility, allowing for hand-wavey answers that feel fair and forgiving, like Steve is really watching out for you.
- **Niche Question Generation**: Who needs friends? Generate your own questions and answers using the power of AI to create your own custom Family Feud experience.

## Tech Stack

**AI Model**:  
  - OpenAI GPT-4  

**Backend (Python)**:   
  - FastAPI  
  - SQLite  
  - TheFuzz  
  - Pydantic

**Frontend (TypeScript)**:  
  - React   
  - React-Router
  - TailwindCSS
  - Motion
  - React-Hot-Toast

## Blurb

For the past while, I've been pretty interested in The New York Times' *Connections* game. I thought it would be interesting to build something similar based around one of my favorite game shows, *Family Feud*. I also wanted to learn how to incorporate an AI model into my code, since it's something that's pretty hot right now.

I built the backend using Python, FastAPI, and SQLite. I handled fuzzy string matching using TheFuzz to make inputting answers less annoying. A big thing I wanted to accomplish with this project was having hand-wavey answers. You know, on the show when they say one thing, but the board says something slightly different, yet they still give them the correct answer? Yeah, that’s what I wanted to go for.

I accomplished this by using OpenAI's GPT-4, which generates a wide and diverse list of synonyms and alternative ways to describe each of the answers in the puzzle. Each of these answers is mapped to the "correct" answer, which makes inputting answers feel magical when it "just knows" to give the player the answer.

Questions and answers are stored in an SQLite database. I think it technically would make more sense in my case to use a non-relational database, but I just wanted to learn more about SQL.

On the front end, I'm using React, with Motion for animations, and React-Router for routing. I'm also using TailwindCSS for styling. I styled the UI around a previous iteration of the Mr. Beast store, interestingly enough.

With this being one of my largest projects, I learned a lot about how to manage many components and keep things organized and easy to maintain. I also finally learned why reducers are important (10 useState calls is not ideal!).

I hope you like the project!
