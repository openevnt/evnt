import type { BaseVenue } from "./base";

export interface OnlineVenue extends BaseVenue {
	$type: "directory.evnt.venue.online";

	/** The URL of the online venue */
	url?: string;
}
