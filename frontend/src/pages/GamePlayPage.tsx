import { useParams } from "react-router";
import DailyFeud from "../components/DailyFeud";
import { Header, Footer } from "../components/Utils";

type RouteParams = {
  id: string;
};

function GamePlayPage() {
  const { id = "1" } = useParams<RouteParams>();

  return (
    <>
      <Header />
      <main className="flex justify-center">
        <DailyFeud id={id} />
      </main>
      <Footer />
    </>
  );
}

export default GamePlayPage;
