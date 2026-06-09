import z from "zod";
import type { Venue } from "@evnt/types";
import { PhysicalVenueSchema } from "./PhysicalVenue";
import { OnlineVenueSchema } from "./OnlineVenue";
import { UnknownVenueSchema } from "./UnknownVenue";
import { preprocessVenue } from "./BaseVenue";

export const VenueSchema = z.preprocess(preprocessVenue, z.discriminatedUnion("$type", [
	PhysicalVenueSchema,
	OnlineVenueSchema,
	UnknownVenueSchema,
])).meta({ id: "Venue" }) satisfies z.ZodType<Venue>;
