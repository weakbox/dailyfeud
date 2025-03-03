import { useParams } from "react-router";
import DailyFeud from "../components/DailyFeud";

type RouteParams = {
  id: string;
};

function GamePlayPage() {
  const { id = "1" } = useParams<RouteParams>();

  return (
    <>
      <div className="mb-8 flex items-center justify-between border-b-2 border-black bg-white px-4 py-2 font-black text-black dark:bg-zinc-700 dark:text-white">
        <span className="w-1/3 text-left text-gray-500">WEAKBOX.COM</span>
        <span className="w-1/3 text-center">DAILYFEUD</span>
        <i className="fa-solid fa-circle-info w-1/3 text-right"></i>
      </div>
      <DailyFeud id={id} />
    </>
  );
}

export default GamePlayPage;
