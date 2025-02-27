import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router";
import correct from "../assets/correct.mp3";

const BASE_URL = "http://127.0.0.1:8000";
const GET_QUESTION_URL = (id: number) =>
  `${BASE_URL}/get-question-prompt/${id}`;
const POST_GUESS_URL = `${BASE_URL}/submit-guess/`;

type Question = {
  prompt: string;
  answers: Answer[];
};

type Answer = {
  text: string;
  value: number;
};

function GamePlayPage() {
  const { id } = useParams();
  const [question, setQuestion] = useState<Question>({
    prompt: "",
    answers: [],
  });
  const [guess, setGuess] = useState("");

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
        setQuestion({
          prompt: data.prompt,
          answers: new Array(data.count).fill(""),
        });
      } catch (error) {
        console.error("Error fetching question:", error);
      }
    };

    fetchQuestion();
  }, []);

  useEffect(() => {
    playCorrect();
  }, [question]);

  // Dynamically renders "count" number of answer boxes.
  const renderBoxes = (count: number) =>
    Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        className={`rounded-md border-3 border-black px-4 py-2 text-center font-bold ${question.answers[i].text ? "bg-green-300" : "bg-blue-400"}`}
      >
        {question.answers[i].text ? question.answers[i].text : i + 1}
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
        setQuestion((prevQuestion) => ({
          ...prevQuestion,
          answers: prevQuestion.answers.map((a, i) => ({
            text:
              i + 1 === result.position ? result.answer.toUpperCase() : a.text,
            value: i + 1 === result.position ? result.answer.value : a.value,
          })),
        }));
      }
    } catch (error) {
      console.error("Failed to submit guess:", error);
    }

    setGuess("");
  };

  return (
    <div className="flex w-full flex-col items-center gap-4 p-2 text-center">
      <h1 className="w-full rounded-md border-3 border-black bg-blue-400 px-4 py-2 text-center text-2xl font-bold">
        {question.prompt.toUpperCase()}
      </h1>

      {/* These classes are implemented pretty badly I think. */}
      <div className="grid w-full auto-rows-auto grid-cols-1 gap-2 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-4">
        {renderBoxes(question.answers.length)}
      </div>

      <form onSubmit={handleGuess} className="flex w-full flex-row gap-2">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value.toUpperCase())}
          placeholder="ENTER A GUESS..."
          className="w-4/5 rounded-md border-3 border-black bg-yellow-300 px-4 py-2 font-bold"
        />
        <input
          type="submit"
          value="GUESS"
          className="w-1/5 rounded-md border-3 border-black bg-pink-300 px-4 py-2 font-bold overflow-ellipsis"
          disabled={!guess.trim()}
        />
      </form>

      <Link
        to="/archive"
        className="w-full rounded-md border-3 border-black bg-pink-300 px-4 py-2 font-bold"
      >
        QUESTION ARCHIVE
      </Link>
    </div>
  );
}

export default GamePlayPage;
