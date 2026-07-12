import type { OpenEvnt } from "./event/event.js";
import type {} from "@atcute/lexicons/ambient";

declare module "@atcute/lexicons/ambient" {
	interface Records {
		"directory.evnt.event": OpenEvnt & { $type: "directory.evnt.event" };
	}
}
