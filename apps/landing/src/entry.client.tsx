import { Root } from "./root";
import { hydrateRoot } from "react-dom/client";

const rootElement = document.getElementById("root")!;
hydrateRoot(rootElement, <Root />);
