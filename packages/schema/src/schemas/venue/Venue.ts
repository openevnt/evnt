import z from "zod";
import type { Venue } from "@evnt/types";
import { PhysicalVenueSchema } from "./PhysicalVenue.js";
import { OnlineVenueSchema } from "./OnlineVenue.js";
import { UnknownVenueSchema } from "./UnknownVenue.js";
import { preprocessVenue } from "./BaseVenue.js";

export const VenueSchema = z
	.preprocess(
		preprocessVenue,
		z.discriminatedUnion("$type", [PhysicalVenueSchema, OnlineVenueSchema, UnknownVenueSchema]),
	)
	.meta({ id: "Venue" }) satisfies z.ZodType<Venue>;
