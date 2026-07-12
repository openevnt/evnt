import type { UnknownVenue } from "@evnt/types";
import { VenueBuilder } from "./VenueBuilder";
import type { EventBuilder } from "../EventBuilder";

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
