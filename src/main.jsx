import React from "react";
import ReactDOM from "react-dom/client";
import DinoGame from "./App.jsx";
import "./index.css";

// Render without ChakraProvider for now to avoid runtime errors
// while dependency versions are reconciled. Wrap with ChakraProvider
// once React/Chakra versions are compatible.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <DinoGame />
  </React.StrictMode>
);
