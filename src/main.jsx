import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { startLogInterceptor } from "./logger/LogStore";
import App from "./App";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";

// Start capturing all console output to localStorage logs
startLogInterceptor();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);