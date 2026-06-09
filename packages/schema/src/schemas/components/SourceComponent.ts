import z from "zod";
import type { SourceComponent } from "@evnt/types";

export const SourceComponentSchema = z.object({
	$type: z.literal("directory.evnt.component.source").meta({ description: "The type of the component" }),
	url: z.string().meta({ description: "The URL of the source" }),
}).meta({ id: "SourceComponent" }) satisfies z.ZodType<SourceComponent>;
