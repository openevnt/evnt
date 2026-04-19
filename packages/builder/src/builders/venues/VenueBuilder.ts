import type { Venue, VenueType } from "@evnt/schema";
import type { EventBuilder } from "../EventBuilder";
import { createTranslationAdder } from "../../utils/helpers";

export class VenueBuilder<Type extends VenueType = VenueType> {
	venue: Extract<Venue, { $type: Type }>;
	parent?: EventBuilder;
	constructor(venue: Extract<Venue, { $type: Type }>, parent?: EventBuilder) {
		this.venue = venue;
		this.parent = parent;
	}

	build = () => this.venue;

	setName = createTranslationAdder(() => this.venue.name, this);

	setId(id: string) {
		this.venue.id = id;
		return this;
	}

	setRandomId() {
		this.venue.id = Math.random().toString(36).slice(2);
		return this;
	}
}
