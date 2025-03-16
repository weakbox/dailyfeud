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
};
