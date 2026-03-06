import z from "zod";
import { PhysicalVenueSchema } from "./PhysicalVenue";
import { OnlineVenueSchema } from "./OnlineVenue";
import { UnknownVenueSchema } from "./UnknownVenue";
import { preprocessVenue } from "./BaseVenue";

export type Venue = z.infer<typeof VenueSchema>;
export const VenueSchema = z.preprocess(preprocessVenue, z.discriminatedUnion("type", [
	PhysicalVenueSchema,
	OnlineVenueSchema,
	UnknownVenueSchema,
])).meta({ id: "Venue" });
