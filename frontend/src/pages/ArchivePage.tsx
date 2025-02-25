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
  
  // Can convert to a try/catch/await block later on.
  useEffect(() => {
    fetch(URL)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setPrompts(data);
      });
  }, []);

  return (
    <>
      <h1 className="text-center font-bold text-4xl">QUESTION ARCHIVE</h1>
      <div className="flex flex-col p-2 items-center w-full gap-2 bg-sky-400">
        {prompts.map((p) => (
          <Link 
          key={p.id} 
          to={`/question/${p.id}`}
          className="block w-full bg-white px-2 py-1 font-bold border-4 border-black rounded-lg text-center"
          >
            {p.prompt.toUpperCase()}
          </Link>
        ))}
      </div>
    </>
  );
}

export default ArchivePage;
