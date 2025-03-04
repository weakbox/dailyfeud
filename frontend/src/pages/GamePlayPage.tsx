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
      <DailyFeud id={id} />
      <Footer />
    </>
  );
}

export default GamePlayPage;
