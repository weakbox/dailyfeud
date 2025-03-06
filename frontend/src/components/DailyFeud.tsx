import { useEffect, useRef, useReducer } from "react";
import { Link } from "react-router";
import CountUp from "react-countup";
import AnswerBox from "./AnswerBox";
import correct from "../assets/correct.mp3";
import wrong from "../assets/wrong.mp3";
import ResultsModal from "./ResultsModal";

const BASE_URL = "http://127.0.0.1:8000";
const GET_QUESTION_URL = (id: string): string =>
  `${BASE_URL}/get-question-prompt/${id}`;
const GET_ANSWERS_URL = (id: string): string =>
  `${BASE_URL}/get-all-answers/${id}`;
const POST_GUESS_URL = `${BASE_URL}/submit-guess/`;

interface State {
  prompt: string;
  strikes: number;
  answers: {
    isRevealed: boolean;
    isCorrect: boolean;
    text: string;
    value: number;
  }[];
  guess: string;
  gameStatus: "initializing" | "playing" | "won" | "lost";
  resultsModalIsOpen: boolean;
}

interface Action {
  type:
    | "init_question"
    | "add_strike"
    | "update_guess"
    | "update_answer"
    | "end_game"
    | "fill_answers"
    | "toggle_results_modal";
  payload?: any;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "init_question": {
      const { prompt, answerCount } = action.payload;
      return {
        ...state,
        prompt: prompt,
        answers: new Array(answerCount).fill({
          isRevealed: false,
          isCorrect: false,
          text: "",
          value: 0,
        }),
        gameStatus: "playing",
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
          isRevealed: i + 1 === position ? true : a.isRevealed,
          isCorrect: i + 1 === position ? true : a.isCorrect,
          text: i + 1 === position ? text.toUpperCase() : a.text,
          value: i + 1 === position ? value : a.value,
        })),
      };
    }
    case "end_game": {
      return {
        ...state,
        gameStatus: action.payload,
        resultsModalIsOpen: !state.resultsModalIsOpen,
      };
    }
    case "fill_answers": {
      return {
        ...state,
        answers: state.answers.map((answer, i) =>
          answer.isCorrect
            ? answer
            : {
                isRevealed: true,
                isCorrect: false,
                text: action.payload[i].answer.toUpperCase(),
                value: action.payload[i].points,
              },
        ),
      };
    }
    case "toggle_results_modal": {
      return { ...state, resultsModalIsOpen: !state.resultsModalIsOpen };
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

function DailyFeud({ id }: { id: string }) {
  const [state, dispatch] = useReducer(reducer, {
    prompt: "",
    strikes: 0,
    answers: [],
    guess: "",
    gameStatus: "initializing",
    resultsModalIsOpen: false,
  });
  const correctRef = useRef(new Audio(correct));
  const wrongRef = useRef(new Audio(wrong));

  // Fetch question from backend on component mount.
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch(GET_QUESTION_URL(id));
        const data = await response.json();

        if (!response.ok) {
          // Learn more about HTTP errors so this makes more sense.
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        dispatch({
          type: "init_question",
          payload: { prompt: data.prompt, answerCount: data.count },
        });
      } catch (error) {
        console.error("Error fetching question:", error);
      }
    };

    fetchQuestion();
  }, []);

  // Check for game over conditions from both the answer array and strikes:
  useEffect(() => {
    if (state.gameStatus !== "playing") {
      return;
    }

    if (state.answers.every((a) => a.isCorrect === true)) {
      dispatch({ type: "end_game", payload: "won" });
    } else if (state.strikes >= 3) {
      dispatch({ type: "end_game", payload: "lost" });
    }
  }, [state.answers, state.strikes]);

  // Reveal missed answers one by one when the game is over:
  useEffect(() => {
    if (state.gameStatus !== "lost") {
      return;
    }

    const fetchAnswers = async () => {
      try {
        const response = await fetch(GET_ANSWERS_URL(id));
        const data = await response.json();
        dispatch({
          type: "fill_answers",
          payload: data,
        });
      } catch (error) {
        console.error("Error fetching question:", error);
      }
    };

    fetchAnswers();
  }, [state.gameStatus]);

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

  const getPlaceholderText = (status: State["gameStatus"]) => {
    switch (status) {
      case "playing":
        return "ENTER A GUESS...";
      case "initializing":
        return "LOADING...";
      default:
        return "GAME OVER";
    }
  };

  const getScore = () =>
    state.answers.reduce(
      (acc: any, curr: any) => (curr.isCorrect ? acc + curr.value : acc),
      0,
    );

  return (
    <div className="flex w-full flex-col items-center gap-4 p-2 text-center">
      <h1 className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-b-4 border-black bg-blue-400 px-4 py-2 text-center text-2xl font-black text-black dark:bg-blue-600 dark:text-white">
        {state.prompt.toUpperCase() || (
          <>
            <span> LOADING QUESTION</span>
            <i className="fa-solid fa-circle-notch animate-spin"></i>
          </>
        )}
      </h1>

      <div className="flex w-full flex-row gap-2">
        <div className="flex w-1/2 items-center justify-center gap-1 rounded-md border-2 border-b-4 border-black bg-white px-4 py-2 font-bold text-black dark:bg-zinc-700 dark:text-white">
          <span>SCORE:</span>
          <CountUp
            start={0}
            end={getScore()}
            duration={0.5}
            preserveValue={true}
          />
        </div>

        <div className="flex w-1/2 items-center justify-center gap-1 rounded-md border-2 border-b-4 border-black bg-red-300 px-4 py-2 font-bold text-black dark:bg-red-500 dark:text-white">
          <span>{state.strikes ? "STRIKES:" : "NO STRIKES"}</span>
          {Array.from({ length: state.strikes }, (_, i) => (
            <i
              key={i}
              className="fa-solid fa-xmark text-red-600 dark:text-white"
            ></i>
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
          onChange={(e) =>
            dispatch({
              type: "update_guess",
              payload: e.target.value,
            })
          }
          placeholder={getPlaceholderText(state.gameStatus)}
          className="w-3/4 rounded-md border-2 border-b-4 border-black bg-white px-4 py-2 font-bold text-black dark:bg-zinc-700 dark:text-white"
          disabled={state.gameStatus !== "playing"}
        />
        {/* Button changes from form submission to modal toggling on game-over. */}
        {state.gameStatus === "won" || state.gameStatus === "lost" ? (
          <button
            type="button" // Prevents form submission!
            className="w-1/4 cursor-pointer rounded-md border-2 border-b-4 border-black bg-white px-4 py-2 font-bold overflow-ellipsis text-black hover:bg-gray-100 dark:bg-zinc-700 dark:text-white hover:dark:bg-zinc-600"
            onClick={() => dispatch({ type: "toggle_results_modal" })}
          >
            VIEW RESULTS
          </button>
        ) : (
          <input
            type="submit"
            value="GUESS"
            className="w-1/4 cursor-pointer rounded-md border-2 border-b-4 border-black bg-white px-4 py-2 font-bold overflow-ellipsis text-black hover:bg-gray-100 dark:bg-zinc-700 dark:text-white hover:dark:bg-zinc-600"
            disabled={!state.guess.trim() || state.gameStatus !== "playing"}
          />
        )}
      </form>

      <Link
        to="/archive"
        className="w-full rounded-md border-2 border-b-4 border-black bg-white px-4 py-2 font-bold text-black hover:bg-gray-100 dark:bg-zinc-700 dark:text-white hover:dark:bg-zinc-600"
      >
        QUESTION ARCHIVE
      </Link>

      <ResultsModal
        id={id}
        score={getScore()}
        strikes={state.strikes}
        isCorrect={state.answers.map((a) => a.isCorrect)}
        isOpen={state.resultsModalIsOpen}
        onClose={() => dispatch({ type: "toggle_results_modal" })}
      />
    </div>
  );
}

export default DailyFeud;
