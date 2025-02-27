import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router";
import correct from "../assets/correct.mp3";

const BASE_URL = "http://127.0.0.1:8000";
const GET_QUESTION_URL = (id) => `${BASE_URL}/get-question-prompt/${id}`;
const POST_GUESS_URL = `${BASE_URL}/submit-guess/`;

function GamePlayPage() {
  const { id } = useParams();
  const [guess, setGuess] = useState("");
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState(null);

  const audioRef = useRef(new Audio(correct));

  const playCorrect = () => {
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch((error) => {
      console.error("Error playing audio:", error);
    });
  };

  // Fetch question when component mounts.
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch(GET_QUESTION_URL(id));
        const data = await response.json();
        setQuestion(data.prompt);
        setAnswers(new Array(data.count).fill(""));
      } catch (error) {
        console.error("Error fetching question:", error);
      }
    };

    fetchQuestion();
  }, []);

  // Play a sound when state of answers updates.
  useEffect(() => {
    playCorrect();
  }, [answers]);

  // Dynamically renders "count" number of answer boxes.
  const renderBoxes = (count) =>
    Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        className={`rounded-md border-3 border-black px-4 py-4 text-center font-bold ${answers[i] ? "bg-green-300" : "bg-blue-400"}`}
      >
        {answers[i] ? answers[i] : i + 1}
      </div>
    ));

  // Handles the form submission of a guess.
  const handleGuess = async (e) => {
    e.preventDefault();

    const guessRequest = { id, guess };

    try {
      const response = await fetch(POST_GUESS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guessRequest),
      });

      if (!response.ok) {
        // Learn more about HTTP errors so this makes more sense.
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Guess submitted successfully:", result);

      if (result.correct) {
        setAnswers((prevAnswers) =>
          prevAnswers.map((a, i) =>
            i + 1 === result.position ? result.answer.toUpperCase() : a,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to submit guess:", error);
    }

    setGuess("");
  };

  return (
    <div className="flex w-full flex-col items-center gap-4 p-2 text-center">
      <h1 className="w-full rounded-md border-3 border-black bg-blue-400 px-4 py-4 text-center text-4xl font-bold">
        {question.toUpperCase()}
      </h1>

      <div className="grid w-full grid-flow-col grid-cols-1 grid-rows-8 gap-2 sm:grid-cols-2 sm:grid-rows-4">
        {answers && renderBoxes(answers.length)}
      </div>

      <form onSubmit={handleGuess} className="flex w-full flex-row gap-2">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value.toUpperCase())}
          placeholder="ENTER A GUESS..."
          className="w-4/5 rounded-md border-3 border-black bg-yellow-300 px-4 py-4 font-bold"
        />
        <input
          type="submit"
          value="ENTER"
          className="w-1/5 rounded-md border-3 border-black bg-pink-300 px-4 py-4 font-bold overflow-ellipsis"
        />
      </form>

      <Link
        to="/archive"
        className="w-full rounded-md border-3 border-black bg-pink-300 px-4 py-4 font-bold"
      >
        QUESTION ARCHIVE
      </Link>
    </div>
  );
}

export default GamePlayPage;
