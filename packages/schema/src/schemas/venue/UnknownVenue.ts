import z from "zod";
import { VenueTypeSchema } from "./VenueType";
import { BaseVenueSchema } from "./BaseVenue";

export type UnknownVenue = z.infer<typeof UnknownVenueSchema>;
export const UnknownVenueSchema = z.object({
	type: z.literal(VenueTypeSchema.enum.unknown),
	...BaseVenueSchema.shape,
}).meta({ id: "UnknownVenue" });
