import z from "zod";
import { TranslationsSchema } from "../types/Translations";
import { VenueSchema } from "./venue/Venue";
import { EventInstanceSchema } from "./instance/EventInstance";
import { EventComponentSchema } from "./components/EventComponent";
import { EventStatusSchema } from "./enums/EventStatus";

export const $ID = "https://raw.githubusercontent.com/deniz-blue/events-format/refs/heads/main/event-data.schema.json" as const;
export const $NSID = "directory.evnt.event" as const;

const preprocessEvent = (input: any) => {
	if (typeof input !== "object" || input === null) return input;
	if (input.v !== 0) return input;
	let data = { ...input };

	data.v = "0.1";

	if (data.components && Array.isArray(data.components))
		data.components = data.components.map(({ type, data }: any) => ({
			$type: ["link", "source", "splashMedia"].includes(type) ? `directory.evnt.component.${type}` : type,
			...data
		}));

	return data;
};

export type EventData = z.infer<typeof EventDataSchema>;
export const EventDataSchema = z.preprocess(preprocessEvent, z.object({
	$type: z.literal($NSID).optional().meta({ description: "The type of the event data" }),
	v: z.literal("0.1").meta({ description: "The version of the Event Data schema" }),

	name: TranslationsSchema.meta({ description: "The name of the event" }),
	label: TranslationsSchema.optional().meta({ description: "A secondary label for the event" }),
	status: EventStatusSchema.optional().meta({ description: "The status of the event" }),

	venues: VenueSchema.array().optional().meta({ description: "The venues associated with this event" }),
	instances: EventInstanceSchema.array().optional().meta({ description: "The instances of the event" }),
	components: EventComponentSchema.array().optional().meta({ description: "Additional components of the event" }),
})).refine((data) => {
	const venueIds = new Set(data.venues?.map(v => v.id));
	return data.instances?.every(instance => instance.venueIds?.every(venueId => venueIds.has(venueId))) ?? true;
}, {
	message: "Incorrect venueIds reference(s)",
}).meta({
	id: "EventData",
	title: "Event Data",
	description: "An event",
	$id: $ID,
});
