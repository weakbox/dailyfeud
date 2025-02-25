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
      <h1>Question Archive</h1>
      <div className="card">
        <ul>
          {prompts.map((p) => (
            <Link key={p.id} to={`/question/${p.id}`}>{p.prompt}</Link>
          ))}
        </ul>
      </div>
    </>
  );
}

export default ArchivePage;
