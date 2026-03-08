import "@typelex/emitter";

namespace directory.evnt.event {
	model Main {
		@required @readOnly v: numeric = 0;
		@required name: Translations;
		label?: Translations;
		status?: EventStatus;
		venues?: Venue[];
		instances?: EventInstance[];
		components?: EventComponent[];
	}

	alias Translations = unknown;
	scalar PartialDate extends string;

	union EventStatus {
		"planned",
		"uncertain",
		"postponed",
		"cancelled",
		"suspended",
		string,
	}

	@inline
	union Venue {
		PhysicalVenue,
		OnlineVenue,
		UnknownVenue,
	}

	model UnknownVenue {
		@required id: string;
		@required @readOnly type: string = "unknown";
		@required name: Translations;
	}

	model PhysicalVenue {
		@required id: string;
		@required @readOnly type: string = "physical";
		@required name: Translations;
		address?: Address;
		coordinates?: Coordinates;
	}

	model Address {
		addr?: string;
		countryCode?: string;
		postalCode?: string;
	}

	model Coordinates {
		@required lat: numeric;
		@required lng: numeric;
	}

	model OnlineVenue {
		@required id: string;
		@required @readOnly type: string = "online";
		@required name: Translations;
		url?: string;
	}

	model EventInstance {
		venueIds?: string[];
		start?: PartialDate;
		end?: PartialDate;
		status?: EventStatus;
	}

	model EventComponent {
		@required type: string;
		@required data: unknown;
	}
}
