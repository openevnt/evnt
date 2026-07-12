import type { OnlineVenue } from "@evnt/types";
import { VenueBuilder } from "./VenueBuilder";
import type { EventBuilder } from "../EventBuilder";

export class OnlineVenueBuilder extends VenueBuilder<"directory.evnt.venue.online"> {
	constructor(venue?: OnlineVenue, parent?: EventBuilder) {
		super(
			venue ?? {
				id: "",
				name: {},
				$type: "directory.evnt.venue.online",
			},
			parent,
		);
	}

	setUrl(url: string) {
		this.venue.url = url;
		return this;
	}
}
