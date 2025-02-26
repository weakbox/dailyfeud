import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";

function GamePlayPage() {
  const { id } = useParams();
  const GET_URL = `http://127.0.0.1:8000/get-question-prompt/${id}`;
  const POST_URL = "http://127.0.0.1:8000/submit-guess/";

  const [guess, setGuess] = useState("");
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState(new Array(8).fill(""));

  // Can convert to a try/catch/await block later on.
  useEffect(() => {
    fetch(GET_URL)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setQuestion(data);
      });
  }, []);

  // Dynamically renders "count" number of answer boxes.
  const renderBoxes = (count) =>
    Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        className={`rounded-lg border-3 border-black px-4 py-4 text-center font-bold ${answers[i] ? "bg-green-400" : "bg-sky-400"}`}
      >
        {i + 1} {answers[i]}
      </div>
    ));

  // Handles the form submission of a guess.
  const handleGuess = async (e) => {
    e.preventDefault();

    const guessRequest = { id, guess };

    try {
      const response = await fetch(POST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guessRequest),
      });

      // Add error handling here for screwy guesses.

      const result = await response.json();
      console.log("Guess submitted successfully:", result);
    } catch (error) {
      console.error("Failed to submit guess:", error);
    }

    setGuess("");
  };

  return (
    <div className="flex w-full flex-col items-center gap-4 p-2 text-center">
      <h1 className="w-full rounded-lg border-3 border-black bg-sky-400 px-4 py-4 text-center text-2xl font-bold">
        {question.toUpperCase()}
      </h1>

      <div className="grid w-full grid-cols-2 gap-2">{renderBoxes(8)}</div>

      <form onSubmit={handleGuess} className="flex w-full flex-row gap-2">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value.toUpperCase())}
          placeholder="ENTER A GUESS..."
          className="w-4/5 rounded-lg border-3 border-black bg-amber-300 px-4 py-4"
        />
        <input
          type="submit"
          value="ENTER"
          className="w-1/5 rounded-lg border-3 border-black bg-pink-400 px-4 py-4 overflow-ellipsis"
        />
      </form>

      <Link
        to="/archive"
        className="w-full rounded-lg border-3 border-black bg-pink-400 px-4 py-4"
      >
        QUESTION ARCHIVE
      </Link>
    </div>
  );
}

export default GamePlayPage;
