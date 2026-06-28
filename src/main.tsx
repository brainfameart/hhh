import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import { EditorApp } from "@editor/EditorApp";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found in DOM.");

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <EditorApp />
  </React.StrictMode>
);
