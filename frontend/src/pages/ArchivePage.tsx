import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "../components/Utils";
import { motion } from "motion/react";
import { GET_ALL_ANSWER_PROMPTS_URL } from "../utils/api";
import { archiveVariants } from "../utils/animations";

type Prompt = {
  id: number;
  prompt: string;
};

export function ArchivePage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  // Fetch all prompts from archive on component mount.
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await fetch(GET_ALL_ANSWER_PROMPTS_URL);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setPrompts(data);
      } catch (error) {
        console.error("Error fetching question:", error);
      }
    };

    fetchPrompts();
  }, []);

  return (
    <>
      <Header />
      {/* No dark-mode support currently (finalizing design). */}
      <main className="m-2 flex justify-center">
        {prompts.length === 0 ? (
          <span className="animate-bounce dark:text-white">Loading...</span>
        ) : (
          <motion.div
            variants={archiveVariants.container}
            initial="hidden"
            animate="visible"
            className="flex w-full max-w-6xl flex-col items-center gap-4 rounded-md border-2 bg-white px-4 pt-1 pb-4"
          >
            <table className="w-full">
              <thead>
                <tr className="border-b-2 font-bold">
                  <th className="px-2 py-1">QUESTION</th>
                  <th className="px-2 py-1">SCORE</th>
                </tr>
              </thead>
              <tbody>
                {prompts.map((p) => (
                  <tr
                    key={p.prompt}
                    className="font-semibold transition odd:bg-rose-200 odd:hover:bg-rose-300 even:hover:bg-gray-100"
                  >
                    <td>
                      {/* Display block makes Link take up entire space, so it becomes easier to click. */}
                      <Link
                        to={`/${p.id}`}
                        className="block h-full w-full px-2 py-1 text-left"
                      >
                        {p.prompt.toUpperCase()}
                      </Link>
                    </td>
                    {/* Eventually use LocalStorage to save scores so the user knows which questions they have finished. */}
                    <td className="px-2 py-1 text-center">N/A</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </main>
      <Footer />
    </>
  );
}
