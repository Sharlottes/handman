import { BrowserRouter, useRoutes } from "react-router-dom";
import { Suspense } from "react";
import ReactDOM from "react-dom/client";
import routes from "~react-pages";
import "./globals.css";

const App = () => {
  return <Suspense fallback={<p>Loading...</p>}>{useRoutes(routes)}</Suspense>;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
