import type { Translations } from "../types/Translations";
import type { AnyComponent } from "./component";
import type { EventInstance } from "./instance";
import type { Venue } from "./venue";


export interface OpenEvnt {
	v: "0.1";
	name: Translations;
	label?: Translations;
	status?: EventStatus;
	instances?: EventInstance[];
	venues?: Venue[];
	components?: AnyComponent[];
}

export type EventStatus =
	| "planned"
	| "uncertain"
	| "postponed"
	| "cancelled"
	| "suspended"
