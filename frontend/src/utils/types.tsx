export interface Answer {
  isRevealed: boolean;
  isCorrect: boolean;
  text: string;
  value: number;
}

export interface GameState {
  prompt: string;
  strikes: number;
  answers: Answer[];
  guess: string;
  gameStatus: "LOADING" | "PLAYING" | "REVEALING" | "GAME_OVER";
  resultsModalIsOpen: boolean;
}

export interface GameAction {
  type:
    | "init_question"
    | "add_strike"
    | "update_guess"
    | "update_answer"
    | "end_game"
    | "reveal_answers"
    | "toggle_results_modal";
  payload?: any;
}
