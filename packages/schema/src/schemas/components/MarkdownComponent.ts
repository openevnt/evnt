import z from "zod";
import type { RichTextMarkdownComponent } from "@evnt/types";

export const MarkdownComponentSchema = z.object({
	$type: z.literal("directory.evnt.richtext.markdown"),
	content: z.string().meta({ description: "The markdown content" }),
	language: z.string().optional().meta({ description: "A BCP47 language tag for the markdown content" }),
}).meta({ id: "MarkdownComponent" }) satisfies z.ZodType<RichTextMarkdownComponent>;
