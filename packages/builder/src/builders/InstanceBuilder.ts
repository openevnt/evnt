import type { EventInstance, PartialDate, EventStatus } from "@evnt/schema";
import type { EventBuilder } from "./EventBuilder";

export class InstanceBuilder {
	instance: EventInstance;
	constructor(instance?: EventInstance, public parent?: EventBuilder) {
		this.instance = instance ?? {
			venueIds: [],
		};
	}

	build = () => this.instance;

	addVenueId(venueId: string) {
		this.instance.venueIds.push(venueId);
		return this;
	}

	addAllVenues() {
		this.instance.venueIds.push(...this.parent?.data.venues?.map(v => v.id) ?? []);
	}

	setStart(start?: PartialDate) {
		this.instance.start = start;
		return this;
	}

	setEnd(end?: PartialDate) {
		this.instance.end = end;
		return this;
	}

	setStatus(status: EventStatus) {
		this.instance.status = status;
		return this;
	}
}
