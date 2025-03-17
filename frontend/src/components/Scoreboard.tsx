import { motion } from "motion/react";
import CountUp from "react-countup";
import { strikeVariants } from "../utils/animations";

interface ScoreBoxProps {
  score: number;
}

interface StrikeBoxProps {
  strikes: number;
}

interface ScoreboardProps {
  score: number;
  strikes: number;
}

function ScoreBox({ score }: ScoreBoxProps) {
  return (
    <div className="flex w-1/2 items-center justify-center gap-1 rounded-md border-2 border-b-4 border-black bg-white px-4 py-2 font-bold text-black dark:bg-zinc-700 dark:text-white">
      <span>SCORE:</span>
      <CountUp start={0} end={score} duration={0.5} preserveValue={true} />
    </div>
  );
}

function StrikesBox({ strikes }: StrikeBoxProps) {
  return (
    <motion.div
      key={strikes} // Triggers an animation on state change.
      animate={strikes > 0 ? "shake" : "rest"}
      variants={strikeVariants}
      className="flex w-1/2 items-center justify-center gap-1 rounded-md border-2 border-b-4 border-black bg-red-300 px-4 py-2 font-bold text-black dark:bg-red-500 dark:text-white"
    >
      <span>{strikes ? "STRIKES:" : "NO STRIKES"}</span>
      {Array.from({ length: strikes }, (_, i) => (
        <i
          key={i}
          className="fa-solid fa-xmark text-red-600 dark:text-white"
        ></i>
      ))}
    </motion.div>
  );
}

// I think this component is sort of dumb.
export function Scoreboard({ score, strikes }: ScoreboardProps) {
  return (
    <div className="flex w-full flex-row gap-2">
      <ScoreBox score={score} />
      <StrikesBox strikes={strikes} />
    </div>
  );
}
