import z from "zod";
import type { PhysicalVenue } from "@evnt/types";
import { BaseVenueSchema } from "./BaseVenue";

/** @deprecated Use PhysicalVenue.Address instead */
export type Address = PhysicalVenue["address"];

/** @deprecated LatLng was removed from the spec in v0.1 */
export const LatLngSchema = z.object({
	lat: z.number().meta({ title: "Latitude" }),
	lng: z.number().meta({ title: "Longitude" }),
}).meta({ id: "LatLng" });

export const PhysicalVenueSchema = z.object({
	$type: z.literal("directory.evnt.venue.physical"),
	...BaseVenueSchema.shape,
	address: z.object({
		countryCode: z.string().optional().meta({ description: "The ISO 3166-1 alpha-2 country code" }),
		postalCode: z.string().optional().meta({ description: "The postal code of the address, if any" }),
		addr: z.string().optional().meta({ description: "Full address excluding country and postal code" }),
	}).optional(),
	maps: z.record(z.string(), z.union([z.string(), z.string().array()])).optional().meta({ description: "Map service identifiers keyed by NSID (e.g. `org.openstreetmap.node`, `com.google.places`). Values are the identifier(s) assigned by that service for this location." }),
}).meta({
	id: "PhysicalVenue",
	title: "Physical Venue",
	description: "A venue with a known or unknown physical location"
}) satisfies z.ZodType<PhysicalVenue>;
