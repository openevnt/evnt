import type { OnlineVenue } from "@evnt/schema";
import { VenueBuilder } from "./VenueBuilder";
import type { EventBuilder } from "../EventBuilder";

export class OnlineVenueBuilder extends VenueBuilder<"online"> {
	constructor(venue?: OnlineVenue, parent?: EventBuilder) {
		super(venue ?? {
			id: "",
			name: {},
			type: "online",
		}, parent);
	}

	setUrl(url: string) {
		this.venue.url = url;
		return this;
	}
}
