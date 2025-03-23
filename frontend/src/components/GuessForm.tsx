import { useEffect, useRef, useState } from "react";
import { POST_GUESS_URL } from "../utils/api";
import { Answer, GameAction, GameState } from "../utils/types";

import correct from "../assets/correct.mp3";
import wrong from "../assets/wrong.mp3";
import { showErrorToast } from "./Utils";

interface GuessFormProps {
  id: string;
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const playSound = (ref: React.RefObject<HTMLAudioElement | null>) => {
  if (!ref.current) {
    return;
  }

  ref.current.currentTime = 0;
  ref.current.play().catch((error) => {
    console.error("Error playing audio:", error);
  });
};

export function GuessForm({ id, state, dispatch }: GuessFormProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const controllerRef = useRef<AbortController | null>(null);

  // Is there a better way to handle audio?
  const correctRef = useRef<HTMLAudioElement | null>(null);
  const wrongRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    correctRef.current = new Audio(correct);
    wrongRef.current = new Audio(wrong);
  }, []);

  const handleGuess = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Prevent race conditions due to rapid answer submission:
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const controller = new AbortController();
    controllerRef.current = controller;
    const { signal } = controller;

    const guessRequest = { id, guess: state.guess };

    dispatch({
      type: "update_guess",
      payload: "",
    });

    try {
      const response = await fetch(POST_GUESS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guessRequest),
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      handleResult(result);
    } catch (error) {
      console.error(error);
      showErrorToast(error.message);
    } finally {
      setLoading(false);
    }
  };

  // TODO: Unify type names from API.
  const handleResult = (result: any) => {
    if (!result.correct) {
      dispatch({ type: "add_strike" });
      playSound(wrongRef);
      return;
    }

    dispatch({
      type: "update_answer",
      payload: {
        position: result.position,
        text: result.answer,
        value: result.value,
        isCorrect: true,
      },
    });

    playSound(correctRef);
  };

  return (
    <form onSubmit={handleGuess} className="flex gap-2">
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
        placeholder={
          state.gameStatus == "PLAYING" ? "ENTER A GUESS..." : "GAME OVER"
        }
        className="w-3/4 rounded-md border-2 border-b-4 border-black bg-white px-4 py-2 font-bold text-black dark:bg-zinc-700 dark:text-white"
        disabled={state.gameStatus !== "PLAYING"}
      />

      {/* Button changes from form submission to modal toggling on game-over. */}
      {state.gameStatus === "GAME_OVER" ? (
        <button
          type="button" // Prevents form submission!
          className="w-1/4 rounded-md border-2 border-b-4 border-black bg-white px-4 py-2 font-bold text-black transition hover:bg-gray-100 dark:bg-zinc-700 dark:text-white hover:dark:bg-zinc-600"
          onClick={() => dispatch({ type: "toggle_results_modal" })}
        >
          RESULTS
        </button>
      ) : (
        <button
          type="submit"
          className="flex w-1/4 items-center justify-center gap-2 rounded-md border-2 border-b-4 border-black bg-white px-4 py-2 font-bold text-black transition hover:bg-gray-100 dark:bg-zinc-700 dark:text-white hover:dark:bg-zinc-600"
          disabled={
            loading || state.gameStatus !== "PLAYING" || !state.guess.trim()
          }
        >
          SUBMIT
          {loading && <i className="fa-solid fa-spinner animate-spin"></i>}
        </button>
      )}
    </form>
  );
}
