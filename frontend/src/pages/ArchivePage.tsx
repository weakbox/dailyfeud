import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "../components/Utils";
import { motion, AnimatePresence } from "motion/react";

// Move to .env later on.
const URL = "http://127.0.0.1:8000/get-all-question-prompts";

const variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 1,
      staggerChildren: 0.05,
    },
  },
};

const childVariants = {
  hidden: {
    x: -100,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
  },
};

type Prompt = {
  id: number;
  prompt: string;
};

function ArchivePage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await fetch(URL);
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
      <main className="flex justify-center">
        <div className="flex w-full max-w-2xl flex-col items-center gap-4 p-2 text-center">
          <div className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-b-4 border-black bg-blue-400 px-4 py-2 text-center text-2xl font-black dark:bg-blue-600 dark:text-white">
            <h1>ARCHIVE</h1>
          </div>
          <AnimatePresence>
            {prompts.length > 0 && (
              <motion.div
                className="flex w-full flex-col items-center gap-2"
                variants={variants}
                initial="hidden"
                animate="visible"
              >
                {prompts.map((p) => (
                  <motion.div
                    key={p.id}
                    className="w-full rounded-md border-2 border-b-4 border-black bg-white text-center font-bold hover:bg-gray-100 dark:bg-zinc-700 dark:text-white hover:dark:bg-zinc-600"
                    variants={childVariants}
                  >
                    <Link
                      to={`/question/${p.id}`}
                      className="block h-full w-full px-2 py-1"
                    >
                      {p.prompt.toUpperCase()}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default ArchivePage;
