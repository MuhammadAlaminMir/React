import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Gallery from "./App";
import Congratulations, {Name} from "./Components/Congratulations";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Gallery />
    <Name />
    <Congratulations />
  </StrictMode>
);
