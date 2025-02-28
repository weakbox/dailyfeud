import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router";
import correct from "../assets/correct.mp3";
import wrong from "../assets/wrong.mp3";

const BASE_URL = "http://127.0.0.1:8000";
const GET_QUESTION_URL = (id: string): string =>
  `${BASE_URL}/get-question-prompt/${id}`;
const POST_GUESS_URL = `${BASE_URL}/submit-guess/`;

type RouteParams = {
  id: string;
};

type Question = {
  prompt: string;
  answers: Answer[];
};

type Answer = {
  text: string;
  value: number;
  correct: boolean;
};

function GamePlayPage() {
  const { id } = useParams<RouteParams>();
  const [question, setQuestion] = useState<Question>({
    prompt: "",
    answers: [],
  });
  const [guess, setGuess] = useState("");
  const [strikes, setStrikes] = useState(0);

  const correctRef = useRef(new Audio(correct));
  const wrongRef = useRef(new Audio(wrong));

  // Play a sound effect from a provided audio element reference.
  const playSound = (ref: React.RefObject<HTMLAudioElement>) => {
    if (!ref.current) return;

    ref.current.currentTime = 0;
    ref.current.play().catch((error) => {
      console.error("Error playing audio:", error);
    });
  };

  // Fetch question from backend on component mount.
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch(GET_QUESTION_URL(id));
        const data = await response.json();
        setQuestion({
          prompt: data.prompt,
          answers: new Array(data.count).fill({
            text: "",
            value: 0,
            correct: false,
          }),
        });
      } catch (error) {
        console.error("Error fetching question:", error);
      }
    };

    fetchQuestion();
  }, []);

  // Dynamically render "count" number of answer boxes.
  const renderBoxes = (count: number) =>
    Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        className={`rounded-md border-2 border-b-4 border-black px-4 py-2 text-center font-bold ${question.answers[i].text ? "bg-green-300" : "bg-blue-400"}`}
      >
        {question.answers[i].correct ? question.answers[i].text : i + 1}
        {question.answers[i].correct ? `: ${question.answers[i].value}` : ""}
      </div>
    ));

  // Update answers:
  const updateAnswers = (prevAnswers: Answer[], result) =>
    prevAnswers.map((a, i) => ({
      text: i + 1 === result.position ? result.answer.toUpperCase() : a.text,
      value: i + 1 === result.position ? result.value : a.value,
      correct: i + 1 === result.position ? true : a.correct,
    }));

  // Handle form submission for guessing the answer.
  const handleGuess = async (e: React.FormEvent<HTMLFormElement>) => {
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
          answers: updateAnswers(prevQuestion.answers, result),
        }));
        playSound(correctRef);
      } else {
        setStrikes((prevStrikes) => prevStrikes + 1);
        playSound(wrongRef);
        // Add functionality to display strikes, as well as have a game over screen when all strikes are used.
      }
    } catch (error) {
      console.error("Failed to submit guess:", error);
    }

    setGuess("");
  };

  return (
    <div className="flex w-full flex-col items-center gap-4 p-2 text-center">
      <h1 className="w-full rounded-md border-2 border-b-4 border-black bg-blue-400 px-4 py-2 text-center text-2xl font-black">
        {question.prompt.toUpperCase()}
      </h1>

      <div className="flex w-2/5 items-center justify-center gap-1 rounded-md border-2 border-b-4 border-black bg-red-300 px-4 py-2 font-bold">
        <span>STRIKES:</span>
        {Array.from({ length: strikes }, (_, i) => (
          <i key={i} className="fa-solid fa-x text-red-600"></i>
        ))}
      </div>

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
          className="w-4/5 rounded-md border-2 border-b-4 border-black bg-white px-4 py-2 font-bold"
        />
        <input
          type="submit"
          value="GUESS"
          className="w-1/5 rounded-md border-2 border-b-4 border-black px-4 py-2 font-bold overflow-ellipsis bg-white hover:bg-gray-100 cursor-pointer"
          disabled={!guess.trim()}
        />
      </form>

      <Link
        to="/archive"
        className="w-full rounded-md border-2 border-b-4 border-black px-4 py-2 font-bold bg-white hover:bg-gray-100"
      >
        QUESTION ARCHIVE
      </Link>
    </div>
  );
}

export default GamePlayPage;
