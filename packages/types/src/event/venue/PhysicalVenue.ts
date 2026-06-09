import type { BaseVenue } from "./base";

/** Well-known map service NSIDs for autocomplete.
 * Keys follow the pattern `{reverseDomain}.{entityType}`.
 * Values are identifiers assigned by the respective service for this location. */
export interface PhysicalVenueMapService {
	"org.openstreetmap.node": never;
	"org.openstreetmap.way": never;
	"org.openstreetmap.relation": never;
	"com.google.places": never;
	"com.foursquare": never;
	"com.what3words": never;
	"org.geonames": never;
	"wiki.data": never;
};

export namespace PhysicalVenue {
	export interface Address {
		/** The ISO 3166-1 alpha-2 country code */
		countryCode?: string;
		/** The postal code of the address, if any */
		postalCode?: string;
		/** Full address string (most likely excluding country and postal code) */
		addr?: string;
	};
};

export interface PhysicalVenue extends BaseVenue {
	$type: "directory.evnt.venue.physical";

	/** The physical address of the venue */
	address?: PhysicalVenue.Address;

	/**
	 * A record mapping service NSIDs to location identifiers.
	 *
	 * Keys are NSIDs following the pattern `{reverseDomain}.{entityType}`,
	 * uniquely identifying a map service and the type of entity it represents
	 * (e.g. `org.openstreetmap.node`, `org.openstreetmap.way`).
	 *
	 * Values are the identifier(s) assigned by that service for this location.
	 * A string value represents a single identifier; an array represents multiple
	 * (e.g., separate IDs for the building and its address point).
	 */
	maps?: Record<(keyof PhysicalVenueMapService | (string & {})), string | string[]>;
};
