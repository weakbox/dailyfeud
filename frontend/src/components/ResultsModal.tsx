import { useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";

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

  if (!isOpen || !portalRoot) {
    return null;
  }

  const copyToClipboard = () => {
    if (!copyRef.current) {
      return;
    }

    const text = copyRef.current.innerText;
    navigator.clipboard.writeText(text);
  };

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-white/85 p-4 dark:bg-zinc-800/90">
      <div className="w-3/4 max-w-md rounded-md border-2 border-b-4 border-black bg-white p-4 dark:bg-zinc-800 dark:text-white">
        <div className="flex flex-col items-center gap-4">
          <h2 className="border-b-2 text-2xl font-black">RESULTS</h2>

          {/* Sharing text that can be copied. */}
          <div
            ref={copyRef}
            className="cursor-pointer rounded-md bg-zinc-100 px-4 py-2 dark:bg-zinc-700"
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

          <div className="flex w-full flex-col gap-2 text-center sm:flex-row">
            <button
              onClick={onClose}
              className="w-full rounded-md border-2 border-b-4 border-black bg-white px-4 py-2 font-bold hover:bg-gray-100 dark:bg-zinc-700 dark:text-white hover:dark:bg-zinc-600"
            >
              VIEW BOARD
            </button>
            <Link
              to="/archive"
              className="w-full rounded-md border-2 border-b-4 border-black bg-white px-4 py-2 font-bold hover:bg-gray-100 dark:bg-zinc-700 dark:text-white hover:dark:bg-zinc-600"
            >
              QUESTION ARCHIVE
            </Link>
          </div>
        </div>
      </div>
    </div>,
    portalRoot,
  );
}

export default ResultsModal;
