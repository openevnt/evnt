import type { EventInstance, EventStatus, PartialDate } from "@evnt/types";
import type { EventBuilder } from "./EventBuilder";
import { createBuilderAdder } from "../utils/helpers";
import { VenueBuilder } from "./venues/VenueBuilder";

export class InstanceBuilder {
	instance: EventInstance;
	parent?: EventBuilder;
	constructor(instance?: EventInstance, parent?: EventBuilder) {
		this.instance = instance ?? { venueIds: [] };
		this.parent = parent;
	}

	build = () => this.instance;

	setStart(start: PartialDate) {
		this.instance.start = start;
		return this;
	}

	setEnd(end: PartialDate) {
		this.instance.end = end;
		return this;
	}

	setStatus(status: EventStatus) {
		this.instance.status = status;
		return this;
	}

	addAllVenues() {
		this.instance.venueIds.push(
			...(this.parent?.data.venues?.map(v => v.id) ?? [])
		);
		return this;
	}
}
