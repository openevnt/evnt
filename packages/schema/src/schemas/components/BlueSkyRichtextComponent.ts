import z from "zod";

export type BlueSkyRichtextComponent = z.infer<typeof BlueSkyRichtextComponentSchema>;
export const BlueSkyRichtextComponentSchema = z.object({
	$type: z.literal("directory.evnt.component.blueSkyRichtext"),
	text: z.string(),
	facets: z.object({
		index: z.object({
			byteStart: z.number(),
			byteEnd: z.number(),
		}),
		features: z.looseObject({ $type: z.string() }).array(),
	}).array(),
}).meta({ id: "BlueSkyRichtextComponent" });
