import type { Translations } from "../../types/Translations.js";

export interface BaseVenue {
	/** Event scoped unique identifier of the venue for relating to instances */
	id: string;

	/** The name of the venue */
	name: Translations;
}
