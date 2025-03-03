import { useParams, Link } from "react-router";
import DailyFeud from "../components/DailyFeud";

type RouteParams = {
  id: string;
};

function GamePlayPage() {
  const { id = "1" } = useParams<RouteParams>();
  
  // Add a skeleton loader at some point to fill in while the question is being fetched.
  return (
    <>
      <DailyFeud id={id} />
    </>
  );
}

export default GamePlayPage;
