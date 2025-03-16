import { useEffect, useReducer } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Toaster } from "react-hot-toast";

import AnswerBox from "./AnswerBox";
import ResultsModal from "./ResultsModal";
import { Scoreboard } from "./Scoreboard";
import { GuessForm } from "./GuessForm";

import { getAnswersUrl, getQuestionUrl } from "../utils/api";
import { showErrorToast } from "./Utils";
import { answerContainerVariants, answerVariants } from "../utils/animations";
import { gameReducer } from "../utils/dailyFeudReducer";

const MotionAnswerBox = motion.create(AnswerBox);

function DailyFeud({ id }: { id: string }) {
  const [state, dispatch] = useReducer(gameReducer, {
    prompt: "",
    strikes: 0,
    answers: [],
    guess: "",
    gameStatus: "loading",
    resultsModalIsOpen: false,
  });

  const getScore = () =>
    state.answers.reduce(
      (acc: any, curr: any) => (curr.isCorrect ? acc + curr.value : acc),
      0,
    );

  const generateBoxes = (count: number) => {
    return Array.from({ length: count }, (_, i) => (
      <MotionAnswerBox
        variants={answerVariants}
        key={i}
        index={i}
        answer={state.answers[i]}
      />
    ));
  };

  // Fetch question from backend when component mounts:
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch(getQuestionUrl(id));
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
        showErrorToast(`Error fetching question: ${error}`);
        console.error("Error fetching question:", error);
      }
    };

    fetchQuestion();
  }, []);

  // Check if either game-over condition was triggered from the answer array or strikes:
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

  // Reveal missed answers on game-over:
  useEffect(() => {
    if (state.gameStatus !== "lost") {
      return;
    }

    const fetchAnswers = async () => {
      try {
        const response = await fetch(getAnswersUrl(id));
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

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-4 p-2 text-center">
      <h1 className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-b-4 border-black bg-blue-400 px-4 py-2 text-center text-2xl font-black text-black dark:bg-blue-600 dark:text-white">
        {state.prompt ? (
          state.prompt.toUpperCase()
        ) : (
          <>
            <span> LOADING QUESTION</span>
            <i className="fa-solid fa-circle-notch animate-spin"></i>
          </>
        )}
      </h1>

      <Scoreboard score={getScore()} strikes={state.strikes} />

      {/* The grid implementation probably could use some work. The conditional rendering ensures that the animation starts once the content is actually loaded. */}
      {state.gameStatus !== "loading" && (
        <motion.div
          variants={answerContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid w-full auto-rows-auto grid-cols-1 gap-2 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-4"
        >
          {generateBoxes(state.answers.length)}
        </motion.div>
      )}

      <motion.div
        layout="position"
        transition={{ duration: 1, type: "spring" }}
        className="flex w-full flex-col gap-2"
      >
        <GuessForm id={id} state={state} dispatch={dispatch} />
        <Link
          to="/archive"
          className="rounded-md border-2 border-b-4 border-black bg-white px-4 py-2 font-bold text-black hover:bg-gray-100 dark:bg-zinc-700 dark:text-white hover:dark:bg-zinc-600"
        >
          QUESTION ARCHIVE
        </Link>
      </motion.div>

      {/* Renders toast notifications from around the app. Should this be in a different spot? */}
      <Toaster />
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
