import { useEffect, useReducer } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";

import AnswerBox from "./AnswerBox";
import ResultsModal from "./ResultsModal";
import { Scoreboard } from "./Scoreboard";
import { GuessForm } from "./GuessForm";

import { getAnswersUrl, getQuestionUrl } from "../utils/api";
import { showErrorToast } from "./Utils";
import { answerVariants, gameVariants } from "../utils/animations";
import { gameReducer } from "../utils/dailyFeudReducer";
import { Answer } from "../utils/types";

const MotionAnswerBox = motion.create(AnswerBox);

export function DailyFeud({ id }: { id: string }) {
  const [state, dispatch] = useReducer(gameReducer, {
    prompt: "",
    strikes: 0,
    answers: [],
    guess: "",
    gameStatus: "LOADING",
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
        variants={answerVariants.content}
        key={i}
        index={i}
        answer={state.answers[i]}
      />
    ));
  };

  const revealAnswersSequentially = (answers: Answer[]) => {
    let timeoutDelay = 500;

    // The answer type coming from the API differs from the one defined in the frontend. Fix later.
    answers.forEach((answer: any, index: number) => {
      if (!state?.answers[index]?.isCorrect) {
        setTimeout(() => {
          dispatch({
            type: "update_answer",
            payload: {
              position: answer.position,
              text: answer.answer,
              value: answer.points,
              isCorrect: false,
            },
          });
        }, timeoutDelay);
        timeoutDelay += 500;
      }
    });

    // Set the timeout to enter the game over state after all the answers are revealed:
    setTimeout(() => {
      dispatch({ type: "end_game" });
    }, timeoutDelay + 750);
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

  // Check if the game should end due to all answers being correct or reaching 3 strikes.
  useEffect(() => {
    if (state.gameStatus !== "PLAYING") {
      return;
    }

    if (
      state.answers.every((a) => a.isCorrect === true) ||
      state.strikes >= 3
    ) {
      dispatch({ type: "reveal_answers" });
    }
  }, [state.answers, state.strikes]);

  // Fetch and reveal missed answers sequentially when the game enters the "REVEALING" phase.
  // If no answers are left to reveal, this simply delays the results modal briefly.
  useEffect(() => {
    if (state.gameStatus !== "REVEALING") {
      return;
    }

    const fetchAnswers = async () => {
      try {
        const response = await fetch(getAnswersUrl(id));
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();

        revealAnswersSequentially(data);
      } catch (error) {
        console.error("Error when fetching answers:", error);
      }
    };

    fetchAnswers();
  }, [state.gameStatus]);

  const score = getScore();

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-4 p-2 text-center">
      {/* The grid implementation probably could use some work. The conditional rendering ensures that the animation starts once the content is actually loaded. */}
      {state.gameStatus === "LOADING" ? (
        <span>Loading...</span>
      ) : (
        <motion.div
          variants={gameVariants.container}
          initial="hidden"
          animate="visible"
          className="flex w-full flex-col items-center gap-4"
        >
          <h1 className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-b-4 border-black bg-blue-400 px-4 py-2 text-center text-2xl font-black text-black dark:bg-blue-600 dark:text-white">
            {state.prompt.toUpperCase()}
          </h1>
          <Scoreboard score={score} strikes={state.strikes} />
          <motion.div
            variants={answerVariants.container}
            initial="hidden"
            animate="visible"
            className="grid w-full auto-rows-auto grid-cols-1 gap-2 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-4"
          >
            {generateBoxes(state.answers.length)}
          </motion.div>

          <div className="flex w-full flex-col gap-2">
            <GuessForm id={id} state={state} dispatch={dispatch} />
            <Link
              to="/archive"
              className="rounded-md border-2 border-b-4 border-black bg-white px-4 py-2 font-bold text-black hover:bg-gray-100 dark:bg-zinc-700 dark:text-white hover:dark:bg-zinc-600"
            >
              QUESTION ARCHIVE
            </Link>
          </div>
        </motion.div>
      )}

      <ResultsModal
        id={id}
        score={score}
        strikes={state.strikes}
        isCorrect={state.answers.map((a) => a.isCorrect)}
        isOpen={state.resultsModalIsOpen}
        onClose={() => dispatch({ type: "toggle_results_modal" })}
      />
    </div>
  );
}
