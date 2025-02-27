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
    <>
      <h1 className="text-center text-4xl font-bold">QUESTION ARCHIVE</h1>
      <div className="flex w-full flex-col items-center gap-2 p-2">
        {prompts.map((p) => (
          <Link
            key={p.id}
            to={`/question/${p.id}`}
            className="block w-full rounded-md border-3 border-black bg-white px-2 py-1 text-center font-bold"
          >
            {p.prompt.toUpperCase()}
          </Link>
        ))}
      </div>
    </>
  );
}

export default ArchivePage;
