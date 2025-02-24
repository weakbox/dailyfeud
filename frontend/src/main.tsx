import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import GamePage from "./pages/GamePage.tsx";
import LevelSelectPage from "./pages/LevelSelectPage.tsx";

import { createBrowserRouter, RouterProvider } from "react-router";

const router = createBrowserRouter([
  {
    path: "/",
    element: <GamePage />,
    errorElement: <div>404 Not Found. Bad address?</div>, /* Later on, put a Link component on this page to return to the home page. */
  },
  {
    path: "/level-select",
    element: <LevelSelectPage />,
  }
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
