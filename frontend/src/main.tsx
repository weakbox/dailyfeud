import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import GamePlayPage from "./pages/GamePlayPage.tsx";
import ArchivePage from "./pages/ArchivePage.tsx";

import { createBrowserRouter, RouterProvider } from "react-router";

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Home Page - Not Implemented Yet!</div>,
    errorElement: (
      <div>404 Not Found. Bad address?</div>
    ) /* Later on, put a Link component on this page to return to the home page. */,
  },
  {
    path: "/question/:id",
    element: <GamePlayPage />,
    errorElement: (
      <div>404 Not Found. Bad address?</div>
    ) /* Later on, put a Link component on this page to return to the home page. */,
  },
  {
    path: "/archive",
    element: <ArchivePage />,
    errorElement: (
      <div>404 Not Found. Bad address?</div>
    ) /* Later on, put a Link component on this page to return to the home page. */,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
