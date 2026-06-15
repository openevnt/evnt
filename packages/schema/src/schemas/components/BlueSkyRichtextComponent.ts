import z from "zod";
import type { BlueSkyRichtextComponent } from "@evnt/types";

export const BlueSkyRichtextComponentSchema = z.object({
	$type: z.literal("directory.evnt.richtext.bluesky"),
	text: z.string(),
	facets: z.object({
		index: z.object({
			byteStart: z.number(),
			byteEnd: z.number(),
		}),
		features: z.looseObject({ $type: z.string() }).array(),
	}).array(),
}).meta({ id: "BlueSkyRichtextComponent" }) satisfies z.ZodType<BlueSkyRichtextComponent>;
