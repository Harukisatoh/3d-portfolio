import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import { Loader } from "@react-three/drei";
import App from "./App";

ReactDOM.render(
  <>
    <Suspense fallback={null}>
      <App />
    </Suspense>
    <Loader />
  </>,
  document.getElementById("root")
);
