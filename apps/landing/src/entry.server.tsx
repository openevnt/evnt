import { renderToString } from "react-dom/server";
import { Root } from "./root";

export const render = () => renderToString(<Root />);
