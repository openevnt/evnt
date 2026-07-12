import type { UnknownVenue } from "@evnt/types";
import { VenueBuilder } from "./VenueBuilder.js";
import type { EventBuilder } from "../EventBuilder.js";

export class UnknownVenueBuilder extends VenueBuilder<"directory.evnt.venue.unknown"> {
	constructor(venue?: UnknownVenue, parent?: EventBuilder) {
		super(
			venue ?? {
				id: "",
				name: {},
				$type: "directory.evnt.venue.unknown",
			},
			parent,
		);
	}
}
