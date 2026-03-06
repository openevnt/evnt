import z from "zod";
import { VenueTypeSchema } from "./VenueType";
import { BaseVenueSchema } from "./BaseVenue";

export type OnlineVenue = z.infer<typeof OnlineVenueSchema>;
export const OnlineVenueSchema = z.object({
	type: z.literal(VenueTypeSchema.enum.online),
	...BaseVenueSchema.shape,
	url: z.string().optional(),
}).meta({ id: "OnlineVenue" });
