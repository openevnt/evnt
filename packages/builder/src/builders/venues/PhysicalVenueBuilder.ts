import type { PhysicalVenue, LatLng } from "@evnt/schema";
import { VenueBuilder } from "./VenueBuilder";
import type { EventBuilder } from "../EventBuilder";

export class PhysicalVenueBuilder extends VenueBuilder<"physical"> {
	constructor(venue?: PhysicalVenue, parent?: EventBuilder) {
		super(venue ?? {
			id: "",
			name: {},
			type: "physical",
		}, parent);
	}

	setCoordinates(latlng: LatLng) {
		this.venue.coordinates = latlng;
		return this;
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
