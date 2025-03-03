import { useState, useEffect } from "react";
import { Link } from "react-router";

// Move to .env later on.
const URL = "http://127.0.0.1:8000/get-all-question-prompts";

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
    <div className="flex w-full flex-col items-center gap-4 p-2 text-center">
      <div className="flex gap-2 items-center justify-center w-full rounded-md border-2 border-b-4 border-black bg-blue-400 px-4 py-2 text-center text-2xl font-black dark:bg-blue-600 dark:text-white">
        <h1>QUESTION ARCHIVE</h1>
        <i className="fa-solid fa-box-open"></i>
      </div>
      <div className="flex w-full flex-col items-center gap-2">
        {prompts.map((p) => (
          <Link
            key={p.id}
            to={`/question/${p.id}`}
            className="w-full rounded-md border-2 border-b-4 border-black px-4 py-2 text-center font-bold bg-white hover:bg-gray-100 dark:bg-zinc-700 dark:text-white hover:dark:bg-zinc-600"
          >
            {p.prompt.toUpperCase()}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ArchivePage;
