import { Answer } from "../utils/types";

type AnswerBoxProps = {
  ref: React.RefObject<HTMLDivElement>;
  index: number;
  answer: {
    isRevealed: boolean;
    isCorrect: boolean;
    text: string;
    value: number;
  };
};

const UnansweredBox = ({ index }: { index: number }) => (
  <div className="rounded-md border-2 border-b-4 border-black bg-blue-400 px-4 py-2 text-center font-bold text-black dark:bg-blue-600 dark:text-white">
    <span>{index + 1}</span>
  </div>
);

const AnsweredBox = ({ answer }: { answer: Answer }) => (
  <div className="rounded-md border-2 border-b-4 border-black bg-green-300 px-4 py-2 text-center font-bold text-black dark:bg-green-600 dark:text-white">
    <div className="flex justify-between">
      <span>{answer.text}</span>
      <span className="border-l-2 pl-4">{answer.value}</span>
    </div>
  </div>
);

const AnswerBox = ({ index, answer, ...props }: AnswerBoxProps) => (
  // This ref is required for Motion to work correctly with custom components (took me ages to figure out).
  <div ref={props.ref}> 
    {answer.isRevealed ? (
      <AnsweredBox answer={answer} />
    ) : (
      <UnansweredBox index={index} />
    )}
  </div>
);

export default AnswerBox;
