type AnswerBoxProps = {
  index: number;
  answer: {
    isRevealed: boolean;
    isCorrect: boolean;
    text: string;
    value: number;
  };
};

const UnansweredBox = ({ index }: { index: number }) => (
  <div className="rounded-md border-2 border-b-4 border-black bg-blue-400 px-4 py-2 text-center font-bold">
    <span>{index + 1}</span>
  </div>
);

const AnsweredBox = ({ answer }: { answer: Answer }) => (
  <div className="rounded-md border-2 border-b-4 border-black bg-green-300 px-4 py-2 text-center font-bold">
    <div className="flex justify-between">
      <span>{answer.text}</span>
      <span className="pl-4 border-l-2">{answer.value}</span>
    </div>
  </div>
);

const AnswerBox = ({ index, answer }: AnswerBoxProps) =>
  answer.isRevealed ? (
    <AnsweredBox answer={answer} />
  ) : (
    <UnansweredBox index={index} />
  );

export default AnswerBox;
