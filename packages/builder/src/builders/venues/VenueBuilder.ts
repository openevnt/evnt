import type { Venue } from "@evnt/types";
import type { EventBuilder } from "../EventBuilder";
import { createTranslationAdder } from "../../utils/helpers";

type VenueType =
	| "directory.evnt.venue.physical"
	| "directory.evnt.venue.online"
	| "directory.evnt.venue.unknown";

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
