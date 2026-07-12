import z from "zod";
import type { OnlineVenue } from "@evnt/types";
import { BaseVenueSchema } from "./BaseVenue.js";

export const OnlineVenueSchema = z
	.object({
		$type: z.literal("directory.evnt.venue.online"),
		...BaseVenueSchema.shape,
		url: z.string().optional(),
	})
	.meta({ id: "OnlineVenue" }) satisfies z.ZodType<OnlineVenue>;
