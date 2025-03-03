import { useEffect, useRef, useReducer } from "react";
import { useParams, Link } from "react-router";
import CountUp from "react-countup";
import AnswerBox from "../components/AnswerBox";
import correct from "../assets/correct.mp3";
import wrong from "../assets/wrong.mp3";

const BASE_URL = "http://127.0.0.1:8000";
const GET_QUESTION_URL = (id: string): string => `${BASE_URL}/get-question-prompt/${id}`;
const POST_GUESS_URL = `${BASE_URL}/submit-guess/`;

type RouteParams = {
  id: string;
};

interface State {
  prompt: string;
  strikes: number;
  answers: {
    isCorrect: boolean;
    text: string;
    value: number;
  }[];
  guess: string;
  gameStatus: "playing" | "won" | "lost";
}

interface Action {
  type: "init_question" | "add_strike" | "update_guess" | "update_answer";
  payload?: any;
}

function reducer(state: State, action: Action) {
  switch (action.type) {
    case "init_question": {
      const { prompt, answerCount } = action.payload;
      return {
        ...state,
        prompt: prompt,
        answers: new Array(answerCount).fill({
          isCorrect: false,
          text: "",
          value: 0,
        }),
      };
    }
    case "add_strike": {
      return { ...state, strikes: state.strikes + 1 };
    }
    case "update_guess": {
      return { ...state, guess: action.payload.toUpperCase() };
    }
    case "update_answer": {
      const { position, text, value } = action.payload;
      return {
        ...state,
        answers: state.answers.map((a, i) => ({
          isCorrect: i + 1 === position ? true : a.isCorrect,
          text: i + 1 === position ? text.toUpperCase() : a.text,
          value: i + 1 === position ? value : a.value,
        })),
      };
    }
    default:
      throw Error("Unknown action: " + action.type);
  }
}

// Play a sound effect from a provided audio element reference.
const playSound = (ref: React.RefObject<HTMLAudioElement>) => {
  if (!ref.current) return;

  ref.current.currentTime = 0;
  ref.current.play().catch((error) => {
    console.error("Error playing audio:", error);
  });
};

const sumScore = (answers: any) => {
  return answers.reduce((acc: any, curr: any) => acc + curr.value, 0);
};

function GamePlayPage() {
  const { id } = useParams<RouteParams>();

  const [state, dispatch] = useReducer(reducer, {
    prompt: "",
    strikes: 0,
    answers: [],
    guess: "",
    gameStatus: "playing",
  });

  const correctRef = useRef(new Audio(correct));
  const wrongRef = useRef(new Audio(wrong));

  // Fetch question from backend on component mount.
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        if (!id) {
          throw new Error("No question ID provided.");
        }
        const response = await fetch(GET_QUESTION_URL(id));
        const data = await response.json();
        
        dispatch({
          type: "init_question", 
          payload: { prompt: data.prompt, answerCount: data.count }
        });
      } catch (error) {
        console.error("Error fetching question:", error);
      }
    };

    fetchQuestion();
  }, []);

  // Dynamically generate "count" number of answer boxes.
  const generateBoxes = (count: number) =>
    Array.from({ length: count }, (_, i) => (
      <AnswerBox key={i} index={i} answer={state.answers[i]} />
    ));

  // Handle form submission for guessing the answer.
  const handleGuess = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const guessRequest = { id, guess: state.guess };

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
        dispatch({
          type: "update_answer",
          payload: {
            position: result.position,
            text: result.answer,
            value: result.value,
          },
        });
        playSound(correctRef);
      } else {
        dispatch({ type: "add_strike" });
        playSound(wrongRef);
      }
    } catch (error) {
      console.error("Failed to submit guess:", error);
    }

    dispatch({ 
      type: "update_guess",
      payload: "",
    });
  };

  // Add a skeleton loader at some point to fill in while the question is being fetched.
  return (
    <div className="flex w-full flex-col items-center gap-4 p-2 text-center">
      <h1 className="w-full rounded-md border-2 border-b-4 border-black bg-blue-400 px-4 py-2 text-center text-2xl font-black">
        {state.prompt.toUpperCase()}
      </h1>

      <div className="flex w-full flex-row gap-2">
        <div className="flex w-1/2 items-center justify-center gap-1 rounded-md border-2 border-b-4 border-black bg-white px-4 py-2 font-bold">
          <span>SCORE:</span>
          <CountUp
            end={sumScore(state.answers)}
            duration={1}
            preserveValue={true}
          />
        </div>

        <div className="flex w-1/2 items-center justify-center gap-1 rounded-md border-2 border-b-4 border-black bg-red-300 px-4 py-2 font-bold">
          <span>STRIKES:</span>
          {Array.from({ length: state.strikes }, (_, i) => (
            <i key={i} className="fa-solid fa-xmark text-red-600"></i>
          ))}
        </div>
      </div>

      {/* These classes are implemented pretty badly I think. */}
      <div className="grid w-full auto-rows-auto grid-cols-1 gap-2 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-4">
        {generateBoxes(state.answers.length)}
      </div>

      <form onSubmit={handleGuess} className="flex w-full flex-row gap-2">
        <input
          type="text"
          value={state.guess}
          maxLength={32}
          onChange={(e) => dispatch({ 
            type: "update_guess",
            payload: e.target.value,
          })}
          placeholder={state.strikes >= 3 ? "GAME OVER" : "ENTER A GUESS..."}
          className="w-3/4 rounded-md border-2 border-b-4 border-black bg-white px-4 py-2 font-bold"
          disabled={state.strikes >= 3}
        />
        <input
          type="submit"
          value="GUESS"
          className="w-1/4 cursor-pointer rounded-md border-2 border-b-4 border-black bg-white px-4 py-2 font-bold overflow-ellipsis hover:bg-gray-100"
          disabled={!state.guess.trim() || state.strikes >= 3}
        />
      </form>

      <Link
        to="/archive"
        className="w-full rounded-md border-2 border-b-4 border-black bg-white px-4 py-2 font-bold hover:bg-gray-100"
      >
        QUESTION ARCHIVE
      </Link>
    </div>
  );
}

export default GamePlayPage;
