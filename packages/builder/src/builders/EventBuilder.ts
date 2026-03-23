import type { EventData, EventStatus, KnownEventComponent, LinkComponent } from "@evnt/schema";
import { createBuilderAdder, createTranslationAdder } from "../utils/helpers";
import { InstanceBuilder } from "./InstanceBuilder";
import { UnknownVenueBuilder } from "./venues/UnknownVenueBuilder";
import { PhysicalVenueBuilder } from "./venues/PhysicalVenueBuilder";
import { OnlineVenueBuilder } from "./venues/OnlineVenueBuilder";
import { VenueBuilder } from "./venues/VenueBuilder";
import { LinkBuilder } from "./components/LinkBuilder";

export class EventBuilder {
	data: EventData;

	constructor(data?: EventData) {
		this.data = data ?? {
			v: 0,
			name: {},
		};
	}

	build = () => this.data;

	setName = createTranslationAdder(() => this.data.name, this);
	setLabel = createTranslationAdder(() => this.data.label ??= {}, this);

	setStatus(status: EventStatus) {
		this.data.status = status;
		return this;
	}

	addInstance = createBuilderAdder(() => this.data.instances ??= [], InstanceBuilder, this);
	getInstance(index: number) {
		const instances = this.data.instances ??= [];
		if (index < 0 || index >= instances.length) throw new Error("Instance index out of bounds");
		return new InstanceBuilder(instances[index], this);
	}

	addUnknownVenue = createBuilderAdder(() => (this.data.venues ??= []), UnknownVenueBuilder, this);
	addPhysicalVenue = createBuilderAdder(() => (this.data.venues ??= []), PhysicalVenueBuilder, this);
	addOnlineVenue = createBuilderAdder(() => (this.data.venues ??= []), OnlineVenueBuilder, this);
	getVenueWithId(venueId: string) {
		const venues = this.data.venues ??= [];
		const venue = venues.find(v => v.id === venueId);
		if (!venue) throw new Error("Venue with given ID not found");
		return new VenueBuilder(venue, this);
	}

	addCustomComponent<Type extends string, Data extends Record<string, unknown>>(type: Type, data: Data) {
		this.data.components ??= [];
		this.data.components.push({ type, data });
		return this;
	};

	addLink(arg: string | LinkComponent | ((b: LinkBuilder) => LinkBuilder)) {
		this.data.components ??= [];
		const component =
			typeof arg === "function"
				? arg(new LinkBuilder()).build()
				: typeof arg === "string"
					? { type: "link", data: { url: arg } }
					: arg;
		this.data.components ??= [];
		this.data.components.push(component as KnownEventComponent);
		return this;
	}
}
