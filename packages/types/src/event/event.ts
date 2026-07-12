import type { Translations } from "../types/Translations.js";
import type { AnyComponent } from "./component/index.js";
import type { EventInstance } from "./instance/index.js";
import type { Venue } from "./venue/index.js";

export interface OpenEvnt {
	v: "0.1";
	$type?: "directory.evnt.event";
	name: Translations;
	label?: Translations;
	status?: EventStatus;
	instances?: EventInstance[];
	venues?: Venue[];
	components?: AnyComponent[];
}

export type EventStatus = "planned" | "uncertain" | "postponed" | "cancelled" | "suspended";
