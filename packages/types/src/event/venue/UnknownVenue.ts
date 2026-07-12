import type { BaseVenue } from "./base.js";

export interface UnknownVenue extends BaseVenue {
	$type: "directory.evnt.venue.unknown";
}
