import z from "zod";
import { VenueTypeSchema } from "./VenueType";
import { BaseVenueSchema } from "./BaseVenue";

export type Address = z.infer<typeof AddressSchema>;
export const AddressSchema = z.object({
	countryCode: z.string().optional().meta({ description: "The ISO 3166-1 alpha-2 country code" }),
	postalCode: z.string().optional().meta({ description: "The postal code of the address, if any" }),
	addr: z.string().optional().meta({ description: "Full address excluding country and postal code" }),
}).meta({ id: "Address" });

export type LatLng = z.infer<typeof LatLngSchema>;
export const LatLngSchema = z.object({
	lat: z.number().meta({ title: "Latitude" }),
	lng: z.number().meta({ title: "Longitude" }),
}).meta({ id: "LatLng" });

export type PhysicalVenue = z.infer<typeof PhysicalVenueSchema>;
export const PhysicalVenueSchema = z.object({
	type: z.literal(VenueTypeSchema.enum.physical),
	...BaseVenueSchema.shape,
	address: AddressSchema.optional(),
	coordinates: LatLngSchema.optional().meta({ description: "Approximate coordinates" }),
	googleMapsPlaceId: z.string().optional(),
}).meta({
	id: "PhysicalVenue",
	title: "Physical Venue",
	description: "A venue with a known or unknown physical location"
});
