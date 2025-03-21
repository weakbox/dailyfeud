const BASE_URL = import.meta.env.VITE_BASE_URL;

export const GET_LATEST_QUESTION_ID_URL = `${BASE_URL}/get-latest-question-id/`;

export const getQuestionUrl = (id: string): string => `${BASE_URL}/get-question-prompt/${id}/`;

export const getAnswersUrl = (id: string): string => `${BASE_URL}/get-all-answers/${id}/`;

export const POST_GUESS_URL = `${BASE_URL}/submit-guess/`;

export const GET_ALL_ANSWER_PROMPTS_URL = `${BASE_URL}/get-all-question-prompts/`;
