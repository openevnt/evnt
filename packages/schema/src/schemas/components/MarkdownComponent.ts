import z from "zod";
import type { MarkdownComponent } from "@evnt/types";

export const MarkdownComponentSchema = z.object({
	$type: z.literal("directory.evnt.richtext.markdown"),
	markdown: z.string().meta({ description: "The markdown content" }),
	language: z.string().optional().meta({ description: "A BCP47 language tag for the markdown content" }),
}).meta({ id: "MarkdownComponent" }) satisfies z.ZodType<MarkdownComponent>;
