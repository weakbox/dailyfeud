import { useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { showSuccessToast } from "./Utils";
import { modalVariants } from "../utils/animations";

type ResultsModalProps = {
  id: string;
  score: number;
  strikes: number;
  isCorrect: boolean[];
  isOpen: boolean;
  onClose: () => void;
};

function buildResultsString(isCorrect: boolean[]) {
  const ROWS = 4;
  const rows: string[] = [];

  for (let row = 0; row < ROWS; row++) {
    const rowIcons: string[] = [];

    const firstIndex = row;
    if (firstIndex < isCorrect.length) {
      rowIcons.push(isCorrect[firstIndex] ? "✅" : "❌");
    }

    const secondIndex = row + ROWS;
    if (secondIndex < isCorrect.length) {
      rowIcons.push(isCorrect[secondIndex] ? "✅" : "❌");
    }

    rows.push(rowIcons.join(" "));
  }

  return rows.join("\n");
}

function ResultsModal({
  id,
  score,
  strikes,
  isCorrect,
  isOpen,
  onClose,
}: ResultsModalProps) {
  const portalRoot = document.getElementById("portal-root");
  const copyRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = () => {
    if (!copyRef.current) {
      return;
    }

    const text = copyRef.current.innerText;
    navigator.clipboard.writeText(text);
    showSuccessToast("RESULTS COPIED TO CLIPBOARD");
  };

  // TypeScript will complain unless we ensure the portalRoot exists.
  if (!portalRoot) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalVariants.backdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 flex items-start justify-center overflow-y-auto bg-white/85 p-4 dark:bg-zinc-800/85"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants.modal}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mt-24 w-3/4 max-w-md rounded-md border-2 border-b-4 border-black bg-white p-4 dark:bg-zinc-800 dark:text-white"
            onClick={(e) => e.stopPropagation()} // Allows onClick on backdrop to work correctly.
          >
            <div className="flex flex-col items-center gap-4">
              <h2 className="border-b-2 text-2xl font-black">RESULTS</h2>

              <p>
                {strikes < 3
                  ? "Great work getting all the answers!"
                  : "Better luck next time!"}
              </p>

              {/* Sharing text that can be copied. */}
              <div
                ref={copyRef}
                className="cursor-pointer rounded-md bg-zinc-100 px-4 py-2 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                onClick={copyToClipboard}
              >
                <div>
                  DailyFeud {id}: {score}/100
                </div>
                <div>Strikes Used: {strikes}</div>
                <div className="whitespace-pre-wrap">
                  {buildResultsString(isCorrect)}
                </div>
              </div>

              <p>Click to copy results to clipboard.</p>

              <div className="flex w-full flex-col gap-2 text-center sm:flex-row">
                <button
                  onClick={onClose}
                  className="w-full cursor-pointer rounded-md border-2 border-b-4 border-black bg-white px-4 py-2 font-bold hover:bg-gray-100 dark:bg-zinc-700 dark:text-white hover:dark:bg-zinc-600"
                >
                  VIEW ANSWERS
                </button>
                <Link
                  to="/archive"
                  className="w-full rounded-md border-2 border-b-4 border-black bg-white px-4 py-2 font-bold hover:bg-gray-100 dark:bg-zinc-700 dark:text-white hover:dark:bg-zinc-600"
                >
                  QUESTION ARCHIVE
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalRoot,
  );
}

export default ResultsModal;
