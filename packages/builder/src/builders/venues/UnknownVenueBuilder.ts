import type { UnknownVenue } from "@evnt/schema";
import type { EventBuilder } from "../EventBuilder";
import { VenueBuilder } from "./VenueBuilder";

export class UnknownVenueBuilder extends VenueBuilder<"unknown"> {
	constructor(venue?: UnknownVenue, parent?: EventBuilder) {
		super(venue ?? {
			id: "",
			name: {},
			type: "unknown",
		}, parent);
	}
}
