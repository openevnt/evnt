import z from "zod";
import type { UnknownVenue } from "@evnt/types";
import { BaseVenueSchema } from "./BaseVenue.js";

export const UnknownVenueSchema = z
	.object({
		$type: z.literal("directory.evnt.venue.unknown"),
		...BaseVenueSchema.shape,
	})
	.meta({ id: "UnknownVenue" }) satisfies z.ZodType<UnknownVenue>;
