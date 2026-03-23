import type { VenueType, Venue } from "@evnt/schema";
import type { EventBuilder } from "../EventBuilder";
import { createTranslationAdder } from "../../utils/helpers";

export class VenueBuilder<Type extends VenueType = VenueType> {
	venue: Venue & { type: Type; };
	parent?: EventBuilder;
	constructor(venue: Venue & { type: Type; }, parent?: EventBuilder) {
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
		this.venue.id = crypto.randomUUID();
		return this;
	}
}
