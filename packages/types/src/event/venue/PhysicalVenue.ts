import type { BaseVenue } from "./base";

/** A record of map service name+entity type NSID's for autocomplete */
export interface PhysicalVenueMapService {
	"org.openstreetmap.node": never;
	"org.openstreetmap.way": never;
};

export interface PhysicalVenue extends BaseVenue {
	$type: "directory.evnt.venue.physical";

	/** The physical address of the venue */
	address?: {
		/** The ISO 3166-1 alpha-2 country code */
		countryCode?: string;
		/** The postal code of the address, if any */
		postalCode?: string;
		/** Full address string (most likely excluding country and postal code) */
		addr?: string;
	};

	/** A record of map service names and entity types to identifiers for the venue's location */
	maps?: Record<(keyof PhysicalVenueMapService | (string & {})), string | string[]>;
};
