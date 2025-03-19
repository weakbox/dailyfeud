import { useEffect } from "react";
import { motion, useAnimate } from "motion/react";
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

export const AnswerBox = ({ index, answer, ...props }: AnswerBoxProps) => {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    // Docs: https://motion.dev/docs/react-use-animate
    animate(
      scope.current,
      { rotateX: answer.isRevealed ? 180 : 0 },
      {
        type: "spring",
        duration: 0.8,
        bounce: 0.4,
      },
    );
  }, [answer.isRevealed]);

  return (
    // This outer div is here to allow staggerChildren to work properly.
    // Hack solution. Is there a better way?
    <motion.div ref={props.ref}>
      <motion.div
        ref={scope}
        className="relative perspective-normal transform-3d" // This perspective is NOT WORKING for whatever reason.
      >
        <div
          className="absolute w-full"
          style={{ backfaceVisibility: "hidden" }}
        >
          <UnansweredBox index={index} />
        </div>
        <div
          className="w-full rotate-x-180"
          style={{ backfaceVisibility: "hidden" }}
        >
          <AnsweredBox answer={answer} />
        </div>
      </motion.div>
    </motion.div>
  );
};
