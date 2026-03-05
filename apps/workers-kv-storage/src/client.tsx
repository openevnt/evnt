import { render } from "hono/jsx/dom";
import { Homepage } from "./pages/homepage";

const root = document.getElementById("root")!;
const props = JSON.parse(root.dataset.props!);

render(<Homepage {...props} />, root);
