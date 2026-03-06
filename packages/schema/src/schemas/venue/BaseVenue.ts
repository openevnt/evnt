import z from "zod";
import { TranslationsSchema } from "../../types/Translations";

// This module is not public

export const BaseVenueSchema = z.object({
	id: z.string().meta({ description: "ID of the venue to be used in Event Instances" }),
	name: TranslationsSchema.meta({ description: "The name of the venue" }),
});

export const preprocessVenue = (obj: any) => {
	if (typeof obj === "object" && obj !== null) return {
		...obj,
		type: obj["type"] || obj["venueType"],
		id: obj["id"] || obj["venueId"],
		name: obj["name"] || obj["venueName"],
	};

	return obj;
};
