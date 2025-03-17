import { useEffect, useRef } from "react";
import { POST_GUESS_URL } from "../utils/api";
import { GameAction, GameState } from "../utils/types";

import correct from "../assets/correct.mp3";
import wrong from "../assets/wrong.mp3";

// Learn more about these verbose types.
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

const getPlaceholderText = (status: GameState["gameStatus"]) => {
  switch (status) {
    case "PLAYING":
      return "ENTER A GUESS...";
    case "LOADING":
      return "LOADING...";
    default:
      return "GAME OVER";
  }
};

export function GuessForm({ id, state, dispatch }: GuessFormProps) {
  const correctRef = useRef<HTMLAudioElement | null>(null);
  const wrongRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    correctRef.current = new Audio(correct);
    wrongRef.current = new Audio(wrong);
  }, []);

  // Can wrap with useCallback?
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
            isCorrect: true,
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
        placeholder={getPlaceholderText(state.gameStatus)}
        className="w-3/4 rounded-md border-2 border-b-4 border-black bg-white px-4 py-2 font-bold text-black dark:bg-zinc-700 dark:text-white"
        disabled={state.gameStatus !== "PLAYING"}
      />
      {/* Button changes from form submission to modal toggling on game-over. */}
      {state.gameStatus === "GAME_OVER" ? (
        <button
          type="button" // Prevents form submission!
          className="w-1/4 rounded-md border-2 border-b-4 border-black bg-white px-4 py-2 font-bold text-black hover:bg-gray-100 dark:bg-zinc-700 dark:text-white hover:dark:bg-zinc-600"
          onClick={() => dispatch({ type: "toggle_results_modal" })}
        >
          VIEW RESULTS
        </button>
      ) : (
        <input
          type="submit"
          value="GUESS"
          className="w-1/4 rounded-md border-2 border-b-4 border-black bg-white px-4 py-2 font-bold text-black hover:bg-gray-100 dark:bg-zinc-700 dark:text-white hover:dark:bg-zinc-600"
          disabled={!state.guess.trim() || state.gameStatus !== "PLAYING"}
        />
      )}
    </form>
  );
}
