import type { Translations } from "../../types/Translations.js";
import type { AnyComponent } from "../component/index.js";

export namespace Activity {
	/** A time in the format HH:MM */
	export type Time = `${string}:${string}`;

	/** A duration in the format H:MM, H can be 1+ digits */
	export type Duration = `${string}:${string}`;

	export interface Slot {
		time?: Time;
		duration?: Duration;
	}
}

export interface Activity {
	/** The name of the activity */
	name: Translations;
	slot?: Activity.Slot;
	components?: AnyComponent[];
}
