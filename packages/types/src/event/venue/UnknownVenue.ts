import type { BaseVenue } from "./base";

export interface UnknownVenue extends BaseVenue {
	$type: "directory.evnt.venue.unknown";
}
