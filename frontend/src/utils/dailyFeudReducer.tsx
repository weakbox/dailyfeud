import { GameAction, GameState } from "./types";

export const gameReducer = (
  state: GameState,
  action: GameAction,
): GameState => {
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
        gameStatus: "PLAYING",
      };
    }
    case "add_strike": {
      return { ...state, strikes: state.strikes + 1 };
    }
    case "update_guess": {
      return { ...state, guess: action.payload.toUpperCase() };
    }
    case "update_answer": {
      const { position, text, value, isCorrect } = action.payload;
      return {
        ...state,
        answers: state.answers.map((a, i) => ({
          isRevealed: i + 1 === position ? true : a.isRevealed,
          isCorrect: i + 1 === position ? isCorrect : a.isCorrect,
          text: i + 1 === position ? text.toUpperCase() : a.text,
          value: i + 1 === position ? value : a.value,
        })),
      };
    }
    case "reveal_answers": {
      return {
        ...state,
        gameStatus: "REVEALING",
      };
    }
    case "end_game": {
      return {
        ...state,
        guess: "",
        gameStatus: "GAME_OVER",
        resultsModalIsOpen: !state.resultsModalIsOpen,
      };
    }
    case "toggle_results_modal": {
      return { ...state, resultsModalIsOpen: !state.resultsModalIsOpen };
    }
    default:
      throw Error("Unknown action: " + action.type);
  }
};
