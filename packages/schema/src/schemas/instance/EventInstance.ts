import z from "zod";
import type { EventInstance } from "@evnt/types";
import { PartialDateSchema } from "../../types/PartialDate";
import { EventStatusSchema } from "../enums/EventStatus";
import { EventActivitySchema } from "./EventActivity";
import { EventComponentSchema } from "../components/EventComponent";

export const EventInstanceSchema = z
	.object({
		id: z.string().optional(),
		venueIds: z
			.string()
			.array()
			.meta({ description: "The IDs of the venues where this event instance takes place" }),
		start: PartialDateSchema.optional().meta({ description: "The start date and/or time" }),
		end: PartialDateSchema.optional().meta({ description: "The end date and/or time" }),

		status: EventStatusSchema.optional().meta({ description: "The status of the event instance" }),
		activities: EventActivitySchema.array()
			.optional()
			.meta({ description: "The activities taking place during this event instance" }),
		components: EventComponentSchema.array()
			.optional()
			.meta({ description: "Additional components of the event instance" }),
	})
	.meta({
		id: "EventInstance",
		title: "Event Instance",
		description:
			"A part of an event that can occur at a known or unknown date and/or time and a known or unknown place or places.",
	}) satisfies z.ZodType<EventInstance>;
