import z from "zod";
import type { RichTextMarkdownComponent } from "@evnt/types";

export const RTMarkdownSchema = z
	.object({
		$type: z.literal("directory.evnt.richtext.markdown"),
		content: z.string().meta({ description: "The markdown content" }),
		language: z
			.string()
			.optional()
			.meta({ description: "A BCP47 language tag for the markdown content" }),
		flavor: z.string().optional().meta({ description: "A string indicating the markdown flavor" }),
	})
	.meta({ id: "directory.evnt.richtext.markdown" }) satisfies z.ZodType<RichTextMarkdownComponent>;
