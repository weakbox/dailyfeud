import { useParams, Link } from "react-router";

function GamePlayPage() {
  const params = useParams();

  return (
    <>
      <h1>DailyFeud {params.questionId}</h1>
      <div className="card">
        <p>This is where the gameplay will be.</p>
        <Link to="/archive">Question Archive</Link>
      </div>
    </>
  );
}

export default GamePlayPage;
