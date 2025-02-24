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
