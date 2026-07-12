import type { PhysicalVenue } from "@evnt/types";
import { VenueBuilder } from "./VenueBuilder.js";
import type { EventBuilder } from "../EventBuilder.js";

export class PhysicalVenueBuilder extends VenueBuilder<"directory.evnt.venue.physical"> {
	constructor(venue?: PhysicalVenue, parent?: EventBuilder) {
		super(
			venue ?? {
				id: "",
				name: {},
				$type: "directory.evnt.venue.physical",
			},
			parent,
		);
	}

	setCountryCode(countryCode: string) {
		this.venue.address ??= {};
		this.venue.address.countryCode = countryCode;
		return this;
	}

	setPostalCode(postalCode: string) {
		this.venue.address ??= {};
		this.venue.address.postalCode = postalCode;
		return this;
	}

	setAddressLine(addressLine: string) {
		this.venue.address ??= {};
		this.venue.address.addr = addressLine;
		return this;
	}
}
