import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { GET_LATEST_QUESTION_ID_URL } from "../utils/api";
import { DailyFeud } from "../components/DailyFeud";
import { Header, Footer, showErrorToast } from "../components/Utils";
import { Toaster } from "react-hot-toast";

type RouteParams = {
  id?: string;
};

export function GamePlayPage() {
  const { id } = useParams<RouteParams>();
  const [latestId, setLatestId] = useState<string | null>(null);

  // Fetch latest question ID on mount if no specific ID was given:
  useEffect(() => {
    if (id) {
      return;
    }

    const fetchLatestId = async () => {
      try {
        const response = await fetch(GET_LATEST_QUESTION_ID_URL);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();

        if (!data.latest_id) {
          throw new Error(`There are no questions in the database!`);
        }

        setLatestId(data.latest_id);
      } catch (error) {
        showErrorToast(error.message);
        console.error("Error fetching latest answer ID:", error.message);
      }
    };

    fetchLatestId();
  }, []);

  const effectiveId = id ?? latestId;

  return (
    <>
      <Header />
      <main className="flex justify-center">
        {!effectiveId ? (
          <span className="animate-bounce dark:text-white">Loading...</span>
        ) : (
          <DailyFeud id={effectiveId} />
        )}
      </main>
      <Toaster position="bottom-center" />
      <Footer />
    </>
  );
}
